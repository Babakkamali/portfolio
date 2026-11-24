import { esc } from './html.ts';

export interface WindowOptions {
  title: string;
  /** Short text on the right side of the title bar. */
  aside?: string;
  asideClass?: string;
  focus?: boolean;
  /** Use a <pre> body for column-aligned output. */
  pre?: boolean;
  className?: string;
  /** Trusted markup. */
  body: string;
  /** Trusted markup shown under the body, edge to edge. */
  footer?: string;
}

export function renderWindow(o: WindowOptions): string {
  const classes = ['win', o.focus ? 'focus' : '', o.className ?? ''].filter(Boolean).join(' ');
  const aside = o.aside
    ? `<span class="${esc(o.asideClass ?? '')}">${esc(o.aside)}</span>`
    : '';
  const tag = o.pre ? 'pre' : 'div';
  return `<section class="${classes}" aria-label="${esc(o.title)}">
  <header class="tb"><span>${esc(o.title)}</span>${aside}</header>
  <${tag} class="bd">${o.body}</${tag}>${o.footer ?? ''}
</section>`;
}
