export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolves after `ms`, and waits longer while the tab is hidden so nothing runs in the background. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const start = () => window.setTimeout(resolve, ms);
    if (!document.hidden) {
      start();
      return;
    }
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onVisible);
      start();
    };
    document.addEventListener('visibilitychange', onVisible);
  });
}
