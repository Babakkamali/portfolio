import { site } from '../content/site.ts';
import { esc } from '../render/html.ts';
import type { Actions } from '../terminal/commands.ts';
import { Shell } from '../terminal/shell.ts';

const CHIPS = ['help', 'about', 'services', 'work', 'ls', 'tree', 'contact', 'mail'];

const WELCOME = [
  `Welcome to <span class="t-green">${esc(site.prompt)}</span>. This shell knows a few things about me.`,
  `Type <span class="t-green">help</span>, or tap a command below. Try <span class="t-green">ls</span>, <span class="t-green">cat about.md</span> or <span class="t-green">tree</span>.`,
];

function template(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'term-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `<section class="win focus term-win" role="dialog" aria-modal="true" aria-labelledby="term-title">
    <header class="tb"><span id="term-title" data-term-title></span><button type="button" class="term-x" data-term-close aria-label="Close the terminal">esc ✕</button></header>
    <div class="term-body" data-term-body>
      <div class="term-out" data-term-out aria-live="polite"></div>
      <form class="term-line" data-term-form>
        <label class="term-prompt" for="term-input" data-term-prompt></label>
        <input id="term-input" class="term-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Command">
      </form>
    </div>
    <div class="term-chips">${CHIPS.map((c) => `<button type="button" data-chip="${c}">${c}</button>`).join('')}</div>
  </section>`;
  return overlay;
}

function promptHtml(prompt: string): string {
  const [user = '', rest = ''] = prompt.split(':');
  return `<span class="t-green">${esc(user)}</span>:<span class="t-blue">${esc(rest.replace(/\$$/, ''))}</span>$`;
}

export function startTerminal(): void {
  let overlay: HTMLElement | null = null;
  let opener: HTMLElement | null = null;

  const build = () => {
    const el = template();
    document.body.append(el);

    const out = el.querySelector<HTMLElement>('[data-term-out]')!;
    const body = el.querySelector<HTMLElement>('[data-term-body]')!;
    const form = el.querySelector<HTMLFormElement>('[data-term-form]')!;
    const input = el.querySelector<HTMLInputElement>('#term-input')!;
    const promptLabel = el.querySelector<HTMLElement>('[data-term-prompt]')!;
    const title = el.querySelector<HTMLElement>('[data-term-title]')!;

    const actions: Actions = {
      clear: () => {
        out.innerHTML = '';
      },
      close: () => window.setTimeout(close, 600),
      goto: (id) => {
        close();
        const target = document.getElementById(id);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
      },
      open: (url) => {
        window.open(url, '_blank', 'noopener');
      },
    };
    const shell = new Shell(site, actions);

    const refreshPrompt = () => {
      promptLabel.innerHTML = promptHtml(shell.prompt());
      title.textContent = `${shell.prompt().replace(/\$$/, '')}`;
    };

    const print = (html: string[]) => {
      if (html.length === 0) return;
      const block = document.createElement('div');
      block.className = 'term-block';
      block.innerHTML = html.join('\n');
      out.append(block);
    };

    const echo = (line: string) => {
      const row = document.createElement('div');
      row.className = 'term-echo';
      row.innerHTML = `${promptHtml(shell.prompt())} ${esc(line)}`;
      out.append(row);
    };

    const scrollDown = () => {
      body.scrollTop = body.scrollHeight;
    };

    let cursor = 0;
    let draft = '';

    const run = (line: string) => {
      echo(line);
      print(shell.run(line));
      cursor = shell.history.length;
      draft = '';
      refreshPrompt();
      scrollDown();
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const line = input.value;
      input.value = '';
      run(line);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const result = shell.complete(input.value);
        if (result.options.length > 0) {
          echo(input.value);
          print([result.options.map(esc).join('  ')]);
          scrollDown();
        }
        input.value = result.line;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (cursor === shell.history.length) draft = input.value;
        cursor = Math.max(0, cursor - 1);
        input.value = shell.history[cursor] ?? input.value;
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        cursor = Math.min(shell.history.length, cursor + 1);
        input.value = shell.history[cursor] ?? draft;
      } else if (event.key === 'l' && event.ctrlKey) {
        event.preventDefault();
        out.innerHTML = '';
      } else if (event.key === 'c' && event.ctrlKey && input.selectionStart === input.selectionEnd) {
        event.preventDefault();
        echo(`${input.value}^C`);
        input.value = '';
        scrollDown();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });

    el.querySelector('[data-term-close]')!.addEventListener('click', close);
    el.addEventListener('click', (event) => {
      if (event.target === el) close();
    });
    el.querySelectorAll<HTMLButtonElement>('[data-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        run(chip.dataset.chip ?? 'help');
        input.focus({ preventScroll: true });
      });
    });
    body.addEventListener('click', () => {
      if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
    });

    print(WELCOME);
    refreshPrompt();
    return { el, input };
  };

  let parts: ReturnType<typeof build> | null = null;

  function open(from?: HTMLElement | null) {
    parts ??= build();
    overlay = parts.el;
    opener = from ?? (document.activeElement as HTMLElement | null);
    overlay.hidden = false;
    document.body.classList.add('term-open');
    parts.input.focus({ preventScroll: true });
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('term-open');
    opener?.focus({ preventScroll: true });
  }

  document.querySelectorAll<HTMLElement>('[data-terminal-open]').forEach((button) => {
    button.addEventListener('click', () => open(button));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== '`' || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    open();
  });
}
