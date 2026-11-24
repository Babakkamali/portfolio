const format = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

export function startClock(): void {
  const clocks = document.querySelectorAll<HTMLTimeElement>('[data-clock]');
  if (clocks.length === 0) return;

  const tick = () => {
    const now = new Date();
    clocks.forEach((el) => {
      el.textContent = format.format(now);
      el.dateTime = now.toISOString();
    });
  };

  tick();
  window.setInterval(tick, 10_000);
}
