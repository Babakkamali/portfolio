import type { Site } from '../content/site';
import { yearsSince } from '../lib/years';
import { contactSection } from './contact';
import { logLine } from './deployLog';
import { esc } from './html';
import { servicesSection } from './servicesMap';
import { workSection } from './work';
import { renderWindow } from './window';

function years(site: Site, now: Date): string {
  return `<span data-years>${yearsSince(site.careerStart, now)}</span>`;
}

function statusBar(site: Site): string {
  const spaces = site.workspaces
    .map(
      (w, i) =>
        `<a class="ws${i === 0 ? ' on' : ''}" href="#${esc(w.id)}"><span>${i + 1}</span><span class="ws-label"> ${esc(w.label)}</span></a>`,
    )
    .join('');
  return `<header class="bar">
  <nav class="ws-list" aria-label="Sections">${spaces}</nav>
  <span class="sp"></span>
  <span class="mod ok">● ${esc(site.availability)}</span>
  <span class="mod net" data-net aria-hidden="true">⇅ –</span>
  <time class="mod clock" data-clock></time>
  <button class="mod term" type="button" data-terminal-open aria-label="Open the terminal">&gt;_<span class="term-label"> terminal</span></button>
</header>`;
}

function hero(site: Site, now: Date): string {
  const intro = esc(site.intro).replace('{years}', years(site, now));
  return renderWindow({
    title: `${site.prompt}: ~`,
    aside: 'whoami',
    focus: true,
    className: 'hero',
    body: `<h1>${esc(site.name)}</h1>
    <p class="role">${esc(site.role)}</p>
    <p>${intro}</p>
    <div class="acts">
      <a class="btn pri" href="#contact">Send me a message</a>
      <button class="btn" type="button" data-terminal-open>&gt;_ Open the terminal</button>
    </div>`,
  });
}

function serviceStatus(site: Site): string {
  const user = site.prompt.split('@')[0] ?? 'babak';
  const tags = site.serviceTags.join(', ');
  return renderWindow({
    title: `systemctl status ${user}`,
    pre: true,
    body: `<span class="c-green">●</span> ${esc(user)}.service - freelance engineer
   <span class="c-mut">Loaded:</span> loaded (since ${site.codingSince})
   <span class="c-mut">Active:</span> <span class="c-green">active (${esc(site.availability)})</span>
    <span class="c-mut">Tasks:</span> 7 (${esc(tags)}…)`,
  });
}

function deployLog(site: Site): string {
  return renderWindow({
    title: 'tail -f deploy.log',
    aside: 'live',
    asideClass: 'c-green',
    pre: true,
    body: `<span data-deploy-log>${site.deployLog.map(logLine).join('\n')}</span>`,
  });
}

export function renderPage(site: Site, now: Date): string {
  return `<div class="desk">
${statusBar(site)}
<main>
  <div class="tiles split" id="home">
    ${hero(site, now)}
    <div class="col">
      ${serviceStatus(site)}
      ${deployLog(site)}
    </div>
  </div>
  ${servicesSection(site)}
  ${workSection(site, now)}
  ${contactSection(site)}
</main>
</div>`;
}
