import type { Service, Site } from '../content/site.ts';
import type { PodState } from '../lib/pipeline.ts';
import { esc } from './html.ts';
import { renderWindow } from './window.ts';

const DEFAULT_SERVICE = 'kubernetes';

/** The still picture, also shown without JavaScript: 9 pods on the new version, 1 starting, 2 still old. */
const PODS: PodState[] = [
  'v0', 'v0', 'v0', 'v0', 'v0', 'v0',
  'v0', 'v0', 'v0', 'updating', 'old', 'old',
];

function link(id: string, label: string, body: string): string {
  return `<a class="map-node k-${id}" href="#svc-${id}" data-service="${id}" aria-label="${esc(label)}">${body}</a>`;
}

function lines(x: number, y: number, step: number, items: string[], cls = 'map-text'): string {
  return items
    .map((t, i) => `<text class="${cls}" x="${x}" y="${y + i * step}">${esc(t)}</text>`)
    .join('');
}

function pods(x: number, y: number, cols: number, size: number, gap: number): string {
  return PODS.map((state, i) => {
    const px = x + (i % cols) * (size + gap);
    const py = y + Math.floor(i / cols) * (size + gap);
    return `<rect class="pod pod-${state}" data-pod="${i}" x="${px}" y="${py}" width="${size}" height="${size}" rx="5"/>`;
  }).join('');
}

/** Small dots moving along the arrows. */
function packets(paths: string[], okPath?: string): string {
  const dots = paths
    .map((d, i) => `<circle class="packet" r="2.5"><animateMotion dur="1.6s" begin="-${(i * 0.5).toFixed(1)}s" repeatCount="indefinite" path="${d}"/></circle>`)
    .join('');
  const ok = okPath
    ? `<circle class="packet ok" r="2.5"><animateMotion dur="2.2s" repeatCount="indefinite" path="${okPath}"/></circle>`
    : '';
  return `<g class="packets" aria-hidden="true">${dots}${ok}</g>`;
}

function markers(suffix: string): string {
  return `<defs>
    <marker id="arrow-${suffix}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="arrow-head" d="M0 0L8 4L0 8z"/></marker>
    <marker id="arrow-ok-${suffix}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="arrow-head ok" d="M0 0L8 4L0 8z"/></marker>
  </defs>`;
}

function wideMap(): string {
  return `<svg class="map map-wide" viewBox="0 0 700 312" role="group" aria-label="Infrastructure map">
  ${markers('w')}
  ${link('cloud', 'cloud', `<rect class="frame" x="96" y="16" width="592" height="208" rx="12"/><text x="112" y="38"><tspan class="map-title">cloud/</tspan><tspan class="map-text"> AWS · Azure · GCP</tspan></text>`)}
  ${link('automation', 'automation', `<text x="674" y="38" text-anchor="end"><tspan class="map-title">automation/</tspan><tspan class="map-text"> all of this as code · Terraform · Ansible</tspan></text>`)}

  <rect class="plain-box" x="12" y="108" width="64" height="44" rx="8"/>
  <text class="map-text" x="44" y="134" text-anchor="middle">internet</text>
  <line class="flow" x1="76" y1="130" x2="109" y2="130" marker-end="url(#arrow-w)"/>

  ${link('network', 'network', `<rect class="box" x="112" y="78" width="130" height="104" rx="8"/><text class="map-title" x="124" y="100">network/</text>${lines(124, 122, 18, ['Route 53 · ALB', 'WAF · VPN', 'VPC · endpoints'])}`)}
  <line class="flow" x1="242" y1="130" x2="265" y2="130" marker-end="url(#arrow-w)"/>

  ${link('kubernetes', 'kubernetes', `<rect class="box box-main" x="268" y="56" width="236" height="148" rx="8"/><text class="map-title" x="282" y="78">kubernetes/</text>${pods(282, 90, 6, 26, 8)}<text class="map-text" x="282" y="172" data-rollout-label>rolling update · 9/12 on v42</text><text class="map-text dim" x="282" y="190">EKS · Helm · Argo CD</text>`)}
  <line class="flow" x1="504" y1="130" x2="529" y2="130" marker-end="url(#arrow-w)"/>

  ${link('data', 'data', `<rect class="box" x="532" y="78" width="142" height="104" rx="8"/><text class="map-title" x="544" y="100">data/</text>${lines(544, 122, 18, ['RDS ⇄ replica', 'ElastiCache · MSK', 'S3 · backups'])}`)}

  ${link('ci-cd', 'ci-cd', `<rect class="box" x="96" y="246" width="356" height="56" rx="8"/><text class="map-title" x="110" y="268">ci-cd/</text><text class="map-text" x="110" y="288">git push → build → test → scan → deploy</text>`)}
  <line class="flow ok" x1="386" y1="246" x2="386" y2="207" marker-end="url(#arrow-ok-w)"/>
  <text class="map-text ok" x="394" y="238">rollout</text>

  ${link('observability', 'observability', `<rect class="box" x="470" y="246" width="218" height="56" rx="8"/><text class="map-title" x="484" y="268">observability/</text><text class="map-text" x="484" y="288">metrics, logs, traces, alerts</text>`)}
  <path class="watch" d="M478 204 L520 246 M603 182 L603 246"/>
  ${packets(['M76 130 L106 130', 'M242 130 L262 130', 'M504 130 L526 130'], 'M386 246 L386 210')}
</svg>`;
}

function tallMap(): string {
  return `<svg class="map map-tall" viewBox="0 0 340 640" role="group" aria-label="Infrastructure map">
  ${markers('t')}
  <rect class="plain-box" x="220" y="8" width="100" height="34" rx="8"/>
  <text class="map-text" x="270" y="30" text-anchor="middle">internet</text>
  <line class="flow" x1="270" y1="42" x2="270" y2="93" marker-end="url(#arrow-t)"/>

  ${link('cloud', 'cloud', `<rect class="frame" x="8" y="60" width="324" height="466" rx="12"/><text x="20" y="80"><tspan class="map-title">cloud/</tspan><tspan class="map-text"> AWS · Azure · GCP</tspan></text>`)}

  ${link('network', 'network', `<rect class="box" x="24" y="96" width="292" height="78" rx="8"/><text class="map-title" x="36" y="118">network/</text>${lines(36, 140, 18, ['Route 53 · ALB · WAF · VPN', 'VPC · endpoints'])}`)}
  <line class="flow" x1="170" y1="174" x2="170" y2="195" marker-end="url(#arrow-t)"/>

  ${link('kubernetes', 'kubernetes', `<rect class="box box-main" x="24" y="198" width="292" height="152" rx="8"/><text class="map-title" x="36" y="220">kubernetes/</text>${pods(36, 232, 6, 30, 10)}<text class="map-text" x="36" y="320" data-rollout-label>rolling update · 9/12 on v42</text><text class="map-text dim" x="36" y="339">EKS · Helm · Argo CD</text>`)}
  <line class="flow" x1="170" y1="350" x2="170" y2="371" marker-end="url(#arrow-t)"/>

  ${link('data', 'data', `<rect class="box" x="24" y="374" width="292" height="100" rx="8"/><text class="map-title" x="36" y="396">data/</text>${lines(36, 418, 18, ['RDS ⇄ replica', 'ElastiCache · MSK', 'S3 · backups'])}`)}

  ${link('automation', 'automation', `<text x="20" y="508"><tspan class="map-title">automation/</tspan><tspan class="map-text"> all of it as code</tspan></text>`)}

  ${link('ci-cd', 'ci-cd', `<rect class="box" x="8" y="542" width="158" height="90" rx="8"/><text class="map-title" x="20" y="564">ci-cd/</text>${lines(20, 586, 18, ['push → build →', 'test → deploy'])}`)}
  ${link('observability', 'observability', `<rect class="box" x="174" y="542" width="158" height="90" rx="8"/><text class="map-title" x="186" y="564">observability/</text>${lines(186, 586, 18, ['metrics · logs', 'traces · alerts'])}`)}
  ${packets(['M270 42 L270 90', 'M170 174 L170 192', 'M170 350 L170 368'])}
</svg>`;
}

function detail(service: Service): string {
  const on = service.id === DEFAULT_SERVICE ? ' on' : '';
  return `<div class="svc-detail k-${esc(service.id)}${on}" id="svc-${esc(service.id)}" data-detail="${esc(service.id)}">
    <b>${esc(service.title)}</b>
    <span>${esc(service.text)}</span>
    <em>${service.tools.map(esc).join(' · ')}</em>
  </div>`;
}

export function servicesSection(site: Site): string {
  return `<div class="tiles" id="services">
  ${renderWindow({
    title: 'services — what I build and run',
    aside: 'click any part',
    className: 'services',
    body: `${wideMap()}
    ${tallMap()}
    <div class="svc-details" aria-live="polite">${site.services.map(detail).join('')}</div>`,
  })}
</div>`;
}
