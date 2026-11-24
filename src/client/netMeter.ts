import { reducedMotion } from './motion';

/** A made-up traffic meter in the status bar that rises while the visitor scrolls. */
export function startNetMeter(): void {
  const meter = document.querySelector<HTMLElement>('[data-net]');
  if (!meter || reducedMotion()) return;

  let boost = 0;
  window.addEventListener('scroll', () => {
    boost = Math.min(boost + 0.4, 6);
  }, { passive: true });

  const tick = () => {
    if (document.hidden) return;
    const value = 0.3 + Math.random() * 1.2 + boost;
    boost *= 0.6;
    meter.textContent = value >= 1 ? `⇅ ${value.toFixed(1)} MB/s` : `⇅ ${Math.round(value * 1000)} kB/s`;
  };

  tick();
  window.setInterval(tick, 1000);
}
