import { site } from '../content/site';
import { yearsSince } from '../lib/years';

/** The page is rendered at build time; refresh the year count in case the build is older than today. */
export function updateYears(now = new Date()): void {
  const value = String(yearsSince(site.careerStart, now));
  document.querySelectorAll<HTMLElement>('[data-years]').forEach((el) => {
    el.textContent = value;
  });
}
