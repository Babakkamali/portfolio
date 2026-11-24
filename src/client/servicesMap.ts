/** Clicking a part of the map shows its description under the map. Without JavaScript every description is listed. */
export function startServicesMap(): void {
  const nodes = document.querySelectorAll<SVGAElement>('[data-service]');
  const details = document.querySelectorAll<HTMLElement>('[data-detail]');
  if (nodes.length === 0) return;

  const select = (id: string) => {
    nodes.forEach((n) => n.classList.toggle('on', n.dataset.service === id));
    details.forEach((d) => d.classList.toggle('on', d.dataset.detail === id));
  };

  nodes.forEach((node) => {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      const id = node.dataset.service;
      if (id) select(id);
    });
  });

  const initial = document.querySelector<HTMLElement>('[data-detail].on')?.dataset.detail;
  if (initial) select(initial);
}
