import type { LogLine } from '../content/site';
import { POD_COUNT, pipelineRun, podColour, type PodState } from '../lib/pipeline';
import { logLine } from '../render/deployLog';
import { reducedMotion, sleep } from './motion';

const VISIBLE_LINES = 5;
const FIRST_VERSION = 42;

const clockTime = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

function setPod(index: number, state: PodState): void {
  document.querySelectorAll<SVGRectElement>(`[data-pod="${index}"]`).forEach((pod) => {
    pod.setAttribute('class', `pod pod-${state}`);
  });
}

function setLabel(text: string): void {
  document.querySelectorAll<SVGTextElement>('[data-rollout-label]').forEach((el) => {
    el.textContent = text;
  });
}

/** Loops simulated releases: the deploy log prints each stage and the map's pods update one by one. */
export async function startLive(): Promise<void> {
  const log = document.querySelector<HTMLElement>('[data-deploy-log]');
  if (!log || reducedMotion()) return;

  const now = () => clockTime.format(new Date());
  const tag = `v${FIRST_VERSION}`;

  // Start from a finished release so the log is full and the first rollout begins cleanly.
  const lines: LogLine[] = [
    { time: now(), stage: 'plan', status: 'ok', detail: '4 to change' },
    { time: now(), stage: 'build', status: 'ok', detail: `image ${tag} pushed to ECR` },
    { time: now(), stage: 'test', status: 'ok', detail: '214 passed' },
    { time: now(), stage: 'rollout', status: 'ok', detail: `${POD_COUNT}/${POD_COUNT} pods on ${tag}` },
    { time: now(), stage: 'observe', status: 'ok', detail: 'p95 84 ms, 0 errors' },
  ];
  const draw = () => {
    log.innerHTML = lines.map(logLine).join('\n');
  };

  draw();
  for (let i = 0; i < POD_COUNT; i++) setPod(i, podColour(FIRST_VERSION));
  setLabel(`${POD_COUNT}/${POD_COUNT} on ${tag} · healthy`);
  await sleep(2500);

  for (let version = FIRST_VERSION + 1; ; version++) {
    for (const step of pipelineRun(version)) {
      switch (step.kind) {
        case 'wait':
          await sleep(step.ms);
          break;
        case 'pod':
          setPod(step.index, step.state);
          break;
        case 'label':
          setLabel(step.text);
          break;
        case 'log': {
          const line: LogLine = {
            time: now(),
            stage: step.stage,
            status: step.status,
            detail: step.detail,
          };
          if (step.replace && lines.length > 0) lines[lines.length - 1] = line;
          else lines.push(line);
          if (lines.length > VISIBLE_LINES) lines.shift();
          draw();
          break;
        }
      }
    }
  }
}
