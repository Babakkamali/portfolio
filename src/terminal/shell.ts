import type { Site } from '../content/site.ts';
import { esc } from '../render/html.ts';
import { commandNames, findCommand, suggest, type Actions, type Ctx, type Output } from './commands.ts';
import { homeDir } from './files.ts';
import { parse } from './parser.ts';
import { HOME, Vfs } from './vfs.ts';

export interface Completion {
  line: string;
  /** Shown under the prompt when more than one name fits. */
  options: string[];
}

function commonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  let prefix = words[0]!;
  for (const w of words) while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

/** Everything the terminal does, without the DOM: run a line, complete a line, keep history and the current directory. */
export class Shell {
  readonly vfs: Vfs;
  cwd: string[] = [...HOME];
  readonly history: string[] = [];

  constructor(
    private readonly site: Site,
    private readonly actions: Actions,
    private readonly rand: () => number = Math.random,
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.vfs = new Vfs(homeDir(site, clock()));
  }

  prompt(): string {
    return `${this.site.prompt}:${this.vfs.display(this.cwd)}$`;
  }

  run(line: string): Output {
    const input = line.trim();
    if (!input) return [];
    this.history.push(input);

    const parsed = parse(input);
    const command = findCommand(parsed.name);
    if (!command) {
      const guess = suggest(parsed.name);
      const hint = guess ? ` Did you mean <span class="t-green">${esc(guess)}</span>?` : '';
      return [`${esc(`command not found: ${parsed.name}.`)}${hint}`, esc('Type help to see what you can do.')];
    }

    const ctx: Ctx = {
      site: this.site,
      vfs: this.vfs,
      cwd: this.cwd,
      history: this.history,
      now: this.clock(),
      rand: this.rand,
      actions: this.actions,
    };
    const out = command.run(ctx, parsed);
    this.cwd = ctx.cwd;
    return out;
  }

  complete(line: string): Completion {
    const spaced = /\s/.test(line);
    if (!spaced) {
      const word = line.toLowerCase();
      const names = commandNames().filter((n) => n.startsWith(word));
      if (names.length === 1) return { line: `${names[0]} `, options: [] };
      return { line: commonPrefix(names) || line, options: names.length > 1 ? names : [] };
    }

    const start = line.slice(0, line.search(/\S*$/));
    const word = line.slice(start.length);
    const slash = word.lastIndexOf('/');
    const folder = slash >= 0 ? word.slice(0, slash + 1) : '';
    const base = slash >= 0 ? word.slice(slash + 1) : word;

    const node = this.vfs.get(this.vfs.resolve(this.cwd, folder || '.'));
    if (!node || node.type !== 'dir') return { line, options: [] };

    const names = this.vfs.list(node, base.startsWith('.')).filter((n) => n.startsWith(base));
    const label = (n: string) => (node.children[n]?.type === 'dir' ? `${n}/` : n);

    if (names.length === 1) {
      const name = names[0]!;
      const end = node.children[name]?.type === 'dir' ? '/' : ' ';
      return { line: `${start}${folder}${name}${end}`, options: [] };
    }
    const prefix = commonPrefix(names);
    return { line: `${start}${folder}${prefix || base}`, options: names.length > 1 ? names.map(label) : [] };
  }
}
