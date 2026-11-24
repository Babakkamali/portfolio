/** Highlights the workspace in the status bar for the section in view. */
export function startWorkspaces(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.ws'));
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((el): el is HTMLElement => el !== null);
  if (sections.length === 0 || !('IntersectionObserver' in window)) return;

  const visible = new Map<string, number>();

  const update = () => {
    let best = sections[0]?.id;
    let bestRatio = 0;
    for (const section of sections) {
      const ratio = visible.get(section.id) ?? 0;
      if (ratio > bestRatio) {
        best = section.id;
        bestRatio = ratio;
      }
    }
    for (const link of links) {
      const on = link.hash === `#${best}`;
      link.classList.toggle('on', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) visible.set(entry.target.id, entry.intersectionRatio);
      update();
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-60px 0px -30% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}
