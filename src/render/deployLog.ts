import type { LogLine } from '../content/site.ts';
import { esc } from './html.ts';

export function logLine(line: LogLine): string {
  const mark = line.status === 'ok' ? '<span class="c-green">✓</span>' : '<span class="c-yellow">●</span>';
  return `<span class="c-mut">${esc(line.time)}</span> ${esc(line.stage.padEnd(8))} ${mark} ${esc(line.detail)}`;
}
