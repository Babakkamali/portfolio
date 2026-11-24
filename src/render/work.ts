import type { Job, Site, Stat } from '../content/site';
import { yearsSince } from '../lib/years';
import { esc } from './html';
import { renderWindow } from './window';

const STAT_COLOURS = ['green', 'cyan', 'yellow', 'purple'];

/** Short, stable commit-like id for a work line (FNV-1a). */
export function shortHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, 7);
}

function sparkline(index: number, years: number): string {
  const open = '<svg class="spark" viewBox="0 0 140 26" preserveAspectRatio="none" aria-hidden="true">';
  switch (index) {
    case 0:
      return `${open}<path class="area" d="M0 24 L18 23 L36 21 L54 20 L72 16 L90 13 L108 8 L124 5 L140 2 L140 26 L0 26z"/><path class="line" d="M0 24 L18 23 L36 21 L54 20 L72 16 L90 13 L108 8 L124 5 L140 2"/></svg>`;
    case 1:
      return `${open}<path class="area" d="M0 22 H28 V17 H56 V12 H84 V7 H112 V3 H140 V26 H0z"/><path class="line" d="M0 22 H28 V17 H56 V12 H84 V7 H112 V3 H140"/></svg>`;
    case 2:
      return `${open}<g class="bars"><rect x="0" y="6" width="42" height="20" rx="2"/><rect x="49" y="10" width="42" height="16" rx="2"/><rect x="98" y="15" width="42" height="11" rx="2"/></g></svg>`;
    default: {
      // One block per full year, plus a faded one for the year in progress.
      const count = years + 1;
      const gap = 4;
      const w = (140 - gap * (count - 1)) / count;
      const blocks = Array.from({ length: count }, (_, i) => {
        const faded = i === count - 1 ? ' class="faded"' : '';
        return `<rect${faded} x="${(i * (w + gap)).toFixed(1)}" y="10" width="${w.toFixed(1)}" height="16" rx="2"/>`;
      }).join('');
      return `${open}<g class="bars">${blocks}</g></svg>`;
    }
  }
}

function stat(s: Stat, index: number, years: number): string {
  const colour = STAT_COLOURS[index % STAT_COLOURS.length];
  const value = esc(s.value).replace('{years}', `<span data-years>${years}</span>`);
  return renderWindow({
    title: s.label,
    className: `stat s-${colour}`,
    body: `<div class="num">${value}</div>
    <div class="note">${esc(s.note)}</div>
    ${sparkline(index, years)}`,
  });
}

function gitLog(work: string[]): string {
  const rows = work
    .map((line) => `<li><span class="hash">${shortHash(line)}</span><span>${esc(line)}</span></li>`)
    .join('');
  return renderWindow({
    title: 'git log --oneline — selected work',
    className: 'gitlog',
    body: `<ol>${rows}</ol>`,
  });
}

function history(jobs: Job[]): string {
  const rows = jobs
    .map(
      (job, i) =>
        `<li><span class="n">${jobs.length - i}</span><span class="when">${esc(job.period)}</span><span class="what">${esc(job.role)} <span class="org">· ${esc(job.org)}</span></span></li>`,
    )
    .join('');
  return renderWindow({
    title: 'history — experience',
    className: 'history',
    body: `<ol>${rows}</ol>`,
  });
}

export function workSection(site: Site, now: Date): string {
  const years = yearsSince(site.careerStart, now);
  return `<div id="work">
  <div class="tiles stats">${site.stats.map((s, i) => stat(s, i, years)).join('')}</div>
  <div class="tiles split-wide">
    ${gitLog(site.work)}
    ${history(site.experience)}
  </div>
</div>`;
}
