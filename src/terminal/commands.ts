import type { Site } from '../content/site.ts';
import { yearsSince } from '../lib/years.ts';
import { esc } from '../render/html.ts';
import { shortHash } from '../render/work.ts';
import { FORBIDDEN, ping, refusal } from './jokes.ts';
import type { Parsed } from './parser.ts';
import { HOME, type FsNode, type Vfs } from './vfs.ts';

export interface Actions {
  clear(): void;
  close(): void;
  /** Closes the terminal and scrolls to a section of the page. */
  goto(id: string): void;
  open(url: string): void;
}

export interface Ctx {
  site: Site;
  vfs: Vfs;
  cwd: string[];
  history: readonly string[];
  now: Date;
  rand: () => number;
  actions: Actions;
}

/** Lines of trusted HTML. Anything from the visitor or the content is escaped before it gets here. */
export type Output = string[];

export interface Command {
  name: string;
  aliases?: string[];
  summary: string;
  group: 'about me' | 'shell' | 'links' | 'other';
  run(ctx: Ctx, cmd: Parsed): Output;
}

const span = (cls: string, text: string) => `<span class="${cls}">${esc(text)}</span>`;
const lines = (text: string) => text.split('\n').map(esc);

function formatName(name: string, node: FsNode): string {
  return node.type === 'dir' ? span('t-dir', `${name}/`) : esc(name);
}

const about: Command = {
  name: 'about',
  aliases: ['whoami', 'intro'],
  summary: 'who I am',
  group: 'about me',
  run: ({ site, now }) => [
    span('t-strong', site.name),
    span('t-cyan', site.role),
    '',
    ...lines(site.intro.replace('{years}', String(yearsSince(site.careerStart, now)))),
  ],
};

const services: Command = {
  name: 'services',
  summary: 'what I build and run',
  group: 'about me',
  run: ({ site }) =>
    site.services.flatMap((s) => [
      span('t-dir', s.title),
      `  ${esc(s.text)}`,
      `  ${span('t-mut', s.tools.join(' · '))}`,
    ]),
};

const work: Command = {
  name: 'work',
  aliases: ['projects'],
  summary: 'selected work, as a git log',
  group: 'about me',
  run: ({ site }) => site.work.map((w) => `${span('t-yellow', shortHash(w))} ${esc(w)}`),
};

const experience: Command = {
  name: 'experience',
  aliases: ['exp'],
  summary: 'where I worked',
  group: 'about me',
  run: ({ site }) =>
    site.experience.map((j) => `${span('t-mut', j.period.padEnd(14))}${esc(j.role)} ${span('t-blue', `· ${j.org}`)}`),
};

const skills: Command = {
  name: 'skills',
  summary: 'tools I use',
  group: 'about me',
  run: ({ site }) => site.services.map((s) => `${span('t-dir', s.title.padEnd(16))}${esc(s.tools.join(', '))}`),
};

const education: Command = {
  name: 'education',
  aliases: ['edu'],
  summary: 'my degree',
  group: 'about me',
  run: ({ site }) => [esc(site.education.degree), span('t-mut', `${site.education.school}, ${site.education.year}`)],
};

const contact: Command = {
  name: 'contact',
  summary: 'how to reach me',
  group: 'about me',
  run: ({ site }) => [
    `Type ${span('t-green', 'mail')} to open the contact form.`,
    '',
    ...site.links.map((l) => `${span('t-mut', l.label.padEnd(10))}<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.href)}</a>`),
  ],
};

const ls: Command = {
  name: 'ls',
  summary: 'list files (-a for hidden, -l for details)',
  group: 'shell',
  run: ({ vfs, cwd }, { args, flags }) => {
    const target = args[0] ?? '.';
    const path = vfs.resolve(cwd, target);
    const node = vfs.get(path);
    if (!node) return [esc(`ls: cannot access '${target}': No such file or directory`)];
    if (node.type === 'file') return [esc(target)];

    const all = flags.has('a') || flags.has('all');
    const names = vfs.list(node, all);
    const entries = all ? ['.', '..', ...names] : names;
    if (flags.has('l')) {
      return entries.map((name) => {
        const child = name === '.' || name === '..' ? node : node.children[name]!;
        const isDir = child.type === 'dir';
        const size = isDir ? 4096 : child.content.length;
        return `${span('t-mut', `${isDir ? 'drwxr-xr-x' : '-rw-r--r--'} babak babak ${String(size).padStart(5)}`)} ${formatName(name, child)}`;
      });
    }
    return [entries.map((name) => formatName(name, name === '.' || name === '..' ? node : node.children[name]!)).join('  ')];
  },
};

const cd: Command = {
  name: 'cd',
  summary: 'change directory',
  group: 'shell',
  run: (ctx, { args }) => {
    const target = args[0] ?? '~';
    const path = ctx.vfs.resolve(ctx.cwd, target);
    const node = ctx.vfs.get(path);
    if (!node) return [esc(`cd: ${target}: No such file or directory`)];
    if (node.type !== 'dir') return [esc(`cd: ${target}: Not a directory`)];
    ctx.cwd = path;
    return [];
  },
};

const cat: Command = {
  name: 'cat',
  summary: 'show a file',
  group: 'shell',
  run: ({ vfs, cwd }, { args }) => {
    if (args.length === 0) return [esc('cat: missing file name, try: cat about.md')];
    return args.flatMap((target) => {
      const node = vfs.get(vfs.resolve(cwd, target));
      if (!node) return [esc(`cat: ${target}: No such file or directory`)];
      if (node.type === 'dir') return [esc(`cat: ${target}: Is a directory`)];
      return lines(node.content);
    });
  },
};

const pwd: Command = {
  name: 'pwd',
  summary: 'where am I',
  group: 'shell',
  run: ({ cwd }) => [esc(`/${cwd.join('/')}`)],
};

function treeLines(vfs: Vfs, node: FsNode, prefix: string, all: boolean): string[] {
  const names = vfs.list(node, all);
  return names.flatMap((name, i) => {
    const child = node.type === 'dir' ? node.children[name]! : node;
    const last = i === names.length - 1;
    const line = `${span('t-mut', prefix + (last ? '└── ' : '├── '))}${formatName(name, child)}`;
    if (child.type !== 'dir') return [line];
    return [line, ...treeLines(vfs, child, prefix + (last ? '    ' : '│   '), all)];
  });
}

const tree: Command = {
  name: 'tree',
  summary: 'show all files',
  group: 'shell',
  run: ({ vfs, cwd }, { args, flags }) => {
    const target = args[0] ?? '.';
    const node = vfs.get(vfs.resolve(cwd, target));
    if (!node) return [esc(`tree: ${target}: No such file or directory`)];
    return [span('t-dir', target), ...treeLines(vfs, node, '', flags.has('a'))];
  },
};

const echo: Command = {
  name: 'echo',
  summary: 'print text',
  group: 'shell',
  run: (_ctx, { raw }) => [esc(raw.trim().replace(/^echo\s*/i, ''))],
};

const clear: Command = {
  name: 'clear',
  summary: 'clear the screen (Ctrl+L)',
  group: 'shell',
  run: ({ actions }) => {
    actions.clear();
    return [];
  },
};

const history: Command = {
  name: 'history',
  summary: 'commands you typed',
  group: 'shell',
  run: ({ history }) => history.map((h, i) => `${span('t-mut', String(i + 1).padStart(4))}  ${esc(h)}`),
};

function linkCommand(name: string): Command {
  return {
    name,
    summary: `open my ${name}`,
    group: 'links',
    run: ({ site, actions }) => {
      const link = site.links.find((l) => l.label === name);
      if (!link) return [];
      actions.open(link.href);
      return [esc(`opening ${link.href.replace(/^https:\/\/(www\.)?/, '')} …`)];
    },
  };
}

const mail: Command = {
  name: 'mail',
  summary: 'write me a message',
  group: 'links',
  run: ({ actions }) => {
    actions.goto('contact');
    return [];
  },
};

const exit: Command = {
  name: 'exit',
  summary: 'close the terminal (Esc)',
  group: 'other',
  run: ({ actions }) => {
    actions.close();
    return [esc('Hope to see you again. Bye!')];
  },
};

const pingCmd: Command = {
  name: 'ping',
  summary: 'is the site up?',
  group: 'other',
  run: ({ rand }, { args }) => ping(args[0] ?? 'babakkamali.com', rand).map(esc),
};

const forbidden: Command[] = FORBIDDEN.map((name) => ({
  name,
  summary: '',
  group: 'other' as const,
  run: ({ rand }: Ctx) => [span('t-orange', refusal(rand))],
}));

const help: Command = {
  name: 'help',
  summary: 'this list',
  group: 'other',
  run: () => {
    const groups: Command['group'][] = ['about me', 'shell', 'links', 'other'];
    const out: Output = [];
    for (const group of groups) {
      out.push(span('t-mut', `# ${group}`));
      for (const c of COMMANDS) {
        if (c.group !== group || !c.summary) continue;
        const names = [c.name, ...(c.aliases ?? [])].join(', ');
        out.push(`  ${span('t-green', names.padEnd(22))}${esc(c.summary)}`);
      }
      out.push('');
    }
    out.push(esc('Tab completes, ↑ ↓ go through history, Esc closes.'));
    return out;
  },
};

export const COMMANDS: Command[] = [
  about, services, work, experience, skills, education, contact,
  ls, cd, cat, pwd, tree, echo, clear, history,
  linkCommand('github'), linkCommand('linkedin'), mail,
  help, exit, pingCmd,
  ...forbidden,
];

const BY_NAME = new Map<string, Command>();
for (const c of COMMANDS) for (const n of [c.name, ...(c.aliases ?? [])]) BY_NAME.set(n, c);

export const commandNames = (): string[] => [...BY_NAME.keys()].sort();

export function findCommand(name: string): Command | undefined {
  return BY_NAME.get(name.toLowerCase());
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length]!;
}

/** The closest real command for a typo, if one is close enough. */
export function suggest(name: string): string | undefined {
  let best: string | undefined;
  let bestDistance = 3;
  for (const candidate of BY_NAME.keys()) {
    const d = distance(name.toLowerCase(), candidate);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  return best;
}

export { HOME };
