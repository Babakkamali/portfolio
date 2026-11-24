import type { LogStatus } from '../content/site.ts';

/** v0 and v1 alternate between releases so a rollout shows as a colour change across the pods. */
export type PodState = 'v0' | 'v1' | 'updating' | 'old';

export type Step =
  | { kind: 'log'; stage: string; status: LogStatus; detail: string; replace?: boolean }
  | { kind: 'pod'; index: number; state: PodState }
  | { kind: 'label'; text: string }
  | { kind: 'wait'; ms: number };

export const POD_COUNT = 12;

export function podColour(version: number): PodState {
  return version % 2 === 0 ? 'v0' : 'v1';
}

/** The steps of one simulated release: plan, build, test, a rolling update pod by pod, then a health check. */
export function pipelineRun(version: number, rand: () => number = Math.random, pods = POD_COUNT): Step[] {
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const tag = `v${version}`;
  const steps: Step[] = [
    { kind: 'log', stage: 'plan', status: 'ok', detail: `${between(1, 9)} to change` },
    { kind: 'wait', ms: 1400 },
    { kind: 'log', stage: 'build', status: 'ok', detail: `image ${tag} pushed to ECR` },
    { kind: 'wait', ms: 1400 },
    { kind: 'log', stage: 'test', status: 'ok', detail: `${between(200, 240)} passed` },
    { kind: 'wait', ms: 1400 },
    { kind: 'log', stage: 'rollout', status: 'running', detail: `0/${pods} pods on ${tag}` },
  ];

  for (let i = 0; i < pods; i++) {
    const done = i + 1;
    steps.push(
      { kind: 'pod', index: i, state: 'updating' },
      { kind: 'wait', ms: 350 },
      { kind: 'pod', index: i, state: podColour(version) },
      {
        kind: 'log',
        replace: true,
        stage: 'rollout',
        status: done === pods ? 'ok' : 'running',
        detail: `${done}/${pods} pods on ${tag}`,
      },
      { kind: 'label', text: `rolling update · ${done}/${pods} on ${tag}` },
      { kind: 'wait', ms: 250 },
    );
  }

  steps.push(
    { kind: 'label', text: `${pods}/${pods} on ${tag} · healthy` },
    { kind: 'log', stage: 'observe', status: 'ok', detail: `p95 ${between(78, 96)} ms, 0 errors` },
    { kind: 'wait', ms: 3000 },
  );
  return steps;
}
