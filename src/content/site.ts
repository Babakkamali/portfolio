import type { YearMonth } from '../lib/years';

export interface Workspace {
  id: string;
  label: string;
}

export type LogStatus = 'ok' | 'running';

export interface LogLine {
  time: string;
  stage: string;
  status: LogStatus;
  detail: string;
}

export interface Site {
  name: string;
  role: string;
  prompt: string;
  availability: string;
  /** Start of DevOps work. Year counts on the page are calculated from it. */
  careerStart: YearMonth;
  codingSince: number;
  /** `{years}` is replaced with the live year count. */
  intro: string;
  workspaces: Workspace[];
  serviceTags: string[];
  deployLog: LogLine[];
}

export const site: Site = {
  name: 'Babak Kamali',
  role: 'Freelance DevOps & cloud engineer',
  prompt: 'babak@cloud',
  availability: 'taking projects',
  careerStart: { year: 2021, month: 1 },
  codingSince: 2015,
  intro:
    'I set up and run cloud infrastructure, networks and deployment pipelines, and automate the work around them. {years}+ years across AWS, Azure, Kubernetes and on-premises.',
  workspaces: [
    { id: 'home', label: 'home' },
    { id: 'services', label: 'services' },
    { id: 'work', label: 'work' },
    { id: 'contact', label: 'contact' },
  ],
  serviceTags: ['cloud', 'network', 'k8s'],
  deployLog: [
    { time: '14:31', stage: 'plan', status: 'ok', detail: '12 to add' },
    { time: '14:32', stage: 'build', status: 'ok', detail: 'image 9f2c1e' },
    { time: '14:32', stage: 'test', status: 'ok', detail: '214 passed' },
    { time: '14:33', stage: 'rollout', status: 'running', detail: '9/12 pods on v42' },
    { time: '14:33', stage: 'observe', status: 'ok', detail: 'p95 84 ms, 0 errors' },
  ],
};
