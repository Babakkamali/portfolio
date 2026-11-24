import type { Site } from '../content/site';
import { esc } from './html';
import { renderWindow } from './window';

export const CONTACT_ENDPOINT = '/api/contact';

export function contactSection(site: Site): string {
  const user = site.prompt.split('@')[0] ?? 'babak';
  const links = site.links
    .map((l) => `<a href="${esc(l.href)}" rel="me noopener" target="_blank">${esc(l.label)}</a>`)
    .join('<span aria-hidden="true"> · </span>');

  return `<div class="tiles" id="contact">
  ${renderWindow({
    title: 'mail — new message',
    className: 'mail',
    body: `<form class="mail-form" method="post" action="${CONTACT_ENDPOINT}" data-contact-form novalidate>
      <span class="label">To:</span><span class="to">${esc(user)}</span>
      <label class="label" for="mail-from">From:</label>
      <input id="mail-from" name="email" type="email" autocomplete="email" required maxlength="200" placeholder="your email">
      <label class="label" for="mail-subject">Subject:</label>
      <input id="mail-subject" name="subject" type="text" maxlength="150" placeholder="what you need built, moved or fixed">
      <label class="sr-only" for="mail-body">Message</label>
      <textarea id="mail-body" name="message" required minlength="10" maxlength="5000" rows="6" placeholder="message"></textarea>
      <div class="trap" aria-hidden="true">
        <label for="mail-website">Leave this empty</label>
        <input id="mail-website" name="website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="send-row">
        <button class="btn pri" type="submit">send ⏎</button>
        <span class="note" data-contact-status role="status">Goes straight to my inbox. I reply by email.</span>
      </div>
    </form>`,
    footer: `<div class="vim-line"><span>-- INSERT --</span><span class="links">${links}</span></div>`,
  })}
</div>`;
}
