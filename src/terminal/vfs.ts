export type FsNode = { type: 'dir'; children: Record<string, FsNode> } | { type: 'file'; content: string };

export const dir = (children: Record<string, FsNode>): FsNode => ({ type: 'dir', children });
export const file = (content: string): FsNode => ({ type: 'file', content });

export const HOME = ['home', 'babak'];

/** A read-only file tree. Paths are kept as segment arrays; `~` is the home directory. */
export class Vfs {
  readonly root: FsNode;

  constructor(home: FsNode) {
    this.root = dir({ home: dir({ babak: home }) });
  }

  /** Resolves `path` against `cwd` into absolute segments. */
  resolve(cwd: string[], path: string): string[] {
    let parts: string[];
    if (path === '~' || path.startsWith('~/')) parts = [...HOME, ...path.slice(2).split('/')];
    else if (path.startsWith('/')) parts = path.split('/');
    else parts = [...cwd, ...path.split('/')];

    const out: string[] = [];
    for (const part of parts) {
      if (part === '' || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out;
  }

  get(path: string[]): FsNode | undefined {
    let node: FsNode | undefined = this.root;
    for (const part of path) {
      if (!node || node.type !== 'dir') return undefined;
      node = node.children[part];
    }
    return node;
  }

  /** Names in a directory, sorted, hidden ones only when asked. */
  list(node: FsNode, all = false): string[] {
    if (node.type !== 'dir') return [];
    return Object.keys(node.children)
      .filter((name) => all || !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b));
  }

  /** `/home/babak/services` -> `~/services` */
  display(path: string[]): string {
    const inHome = HOME.every((part, i) => path[i] === part);
    if (inHome) return `~${path.length > HOME.length ? '/' + path.slice(HOME.length).join('/') : ''}`;
    return `/${path.join('/')}`;
  }
}
