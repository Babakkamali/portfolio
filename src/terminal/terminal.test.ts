import { describe, expect, it } from 'vitest';
import { site } from '../content/site.ts';
import { yearsSince } from '../lib/years.ts';
import { pipelineRun, podColour } from '../lib/pipeline.ts';
import type { Actions } from './commands.ts';
import { suggest } from './commands.ts';
import { parse, tokenize } from './parser.ts';
import { Shell } from './shell.ts';

const strip = (html: string[]) => html.map((l) => l.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'"));

function shell() {
  const calls: string[] = [];
  const actions: Actions = {
    clear: () => calls.push('clear'),
    close: () => calls.push('close'),
    goto: (id) => calls.push(`goto:${id}`),
    open: (url) => calls.push(`open:${url}`),
  };
  return { sh: new Shell(site, actions, () => 0, () => new Date('2026-11-24T12:00:00Z')), calls };
}

describe('parser', () => {
  it('keeps quoted words together', () => {
    expect(tokenize(`echo "hello world" 'a b' c`)).toEqual(['echo', 'hello world', 'a b', 'c']);
  });

  it('splits short and long flags and lower-cases the command', () => {
    const p = parse('LS -la --all services');
    expect(p.name).toBe('ls');
    expect([...p.flags].sort()).toEqual(['a', 'all', 'l']);
    expect(p.args).toEqual(['services']);
  });
});

describe('shell', () => {
  it('starts in the home directory', () => {
    const { sh } = shell();
    expect(sh.prompt()).toBe('babak@cloud:~$');
    expect(strip(sh.run('pwd'))).toEqual(['/home/babak']);
  });

  it('lists files and hides dot files unless -a is given', () => {
    const { sh } = shell();
    const plain = strip(sh.run('ls'))[0]!;
    expect(plain).toContain('services/');
    expect(plain).toContain('about.md');
    expect(plain).not.toContain('.hidden');
    expect(strip(sh.run('ls -a'))[0]).toContain('.hidden/');
  });

  it('changes directory and resolves .. and ~', () => {
    const { sh } = shell();
    sh.run('cd services');
    expect(sh.prompt()).toBe('babak@cloud:~/services$');
    sh.run('cd ..');
    expect(sh.prompt()).toBe('babak@cloud:~$');
    sh.run('cd /home');
    sh.run('cd ~');
    expect(sh.prompt()).toBe('babak@cloud:~$');
  });

  it('reports missing paths like a shell', () => {
    const { sh } = shell();
    expect(strip(sh.run('cd nope'))).toEqual(['cd: nope: No such file or directory']);
    expect(strip(sh.run('cat services'))).toEqual(['cat: services: Is a directory']);
  });

  it('reads files generated from the content', () => {
    const { sh } = shell();
    const about = strip(sh.run('cat about.md')).join('\n');
    expect(about).toContain(site.name);
    expect(about).toContain(`${yearsSince(site.careerStart, new Date('2026-11-24'))}+ years`);
    expect(strip(sh.run('cat services/kubernetes.md')).join('\n')).toContain('EKS');
  });

  it('accepts capitalised commands and aliases', () => {
    const { sh } = shell();
    expect(strip(sh.run('Whoami'))[0]).toBe(site.name);
    expect(strip(sh.run('exp')).length).toBe(site.experience.length);
  });

  it('suggests the closest command for a typo', () => {
    const { sh } = shell();
    expect(suggest('servics')).toBe('services');
    expect(strip(sh.run('servics'))[0]).toContain('Did you mean services?');
  });

  it('refuses sudo with a joke', () => {
    const { sh } = shell();
    expect(strip(sh.run('sudo rm -rf /'))[0]).toBe('Nice try... (ಠ(ಠ(ಠ_ಠ)ಠ)ಠ)');
  });

  it('escapes what the visitor types', () => {
    const { sh } = shell();
    expect(sh.run('echo <img src=x>')[0]).toBe('&lt;img src=x&gt;');
  });

  it('calls the page for clear, mail, links and exit', () => {
    const { sh, calls } = shell();
    sh.run('clear');
    sh.run('mail');
    sh.run('github');
    sh.run('exit');
    expect(calls).toEqual(['clear', 'goto:contact', 'open:https://github.com/Babakkamali', 'close']);
  });

  it('keeps a history', () => {
    const { sh } = shell();
    sh.run('ls');
    sh.run('pwd');
    expect(strip(sh.run('history')).map((l) => l.trim())).toEqual(['1  ls', '2  pwd', '3  history']);
  });
});

describe('completion', () => {
  it('completes a unique command', () => {
    const { sh } = shell();
    expect(sh.complete('serv')).toEqual({ line: 'services ', options: [] });
  });

  it('lists options when more than one command fits', () => {
    const { sh } = shell();
    const c = sh.complete('e');
    expect(c.options).toEqual(expect.arrayContaining(['echo', 'education', 'exit', 'experience']));
  });

  it('completes paths, adding a slash for folders', () => {
    const { sh } = shell();
    expect(sh.complete('cd serv').line).toBe('cd services/');
    expect(sh.complete('cat services/kub').line).toBe('cat services/kubernetes.md ');
    expect(sh.complete('ls .hid').line).toBe('ls .hidden/');
  });
});

describe('years counter', () => {
  it('counts whole years from January 2021', () => {
    const start = { year: 2021, month: 1 };
    expect(yearsSince(start, new Date(2026, 10, 24))).toBe(5);
    expect(yearsSince(start, new Date(2026, 11, 31))).toBe(5);
    expect(yearsSince(start, new Date(2027, 0, 1))).toBe(6);
  });
});

describe('release simulator', () => {
  it('rolls every pod to the new version and ends healthy', () => {
    const steps = pipelineRun(43, () => 0.5);
    const finalPods = new Map<number, string>();
    for (const s of steps) if (s.kind === 'pod') finalPods.set(s.index, s.state);
    expect(finalPods.size).toBe(12);
    expect(new Set(finalPods.values())).toEqual(new Set([podColour(43)]));
    const labels = steps.filter((s) => s.kind === 'label');
    expect(labels.at(-1)).toEqual({ kind: 'label', text: '12/12 on v43 · healthy' });
  });
});
