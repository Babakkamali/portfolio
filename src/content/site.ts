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

export interface Service {
  id: string;
  title: string;
  text: string;
  tools: string[];
}

export interface Stat {
  label: string;
  /** `{years}` is replaced with the live year count. */
  value: string;
  note: string;
}

export interface Job {
  period: string;
  role: string;
  org: string;
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
  services: Service[];
  stats: Stat[];
  /** Newest first. Shown as a git log. */
  work: string[];
  experience: Job[];
}

export const site: Site = {
  name: 'Babak Kamali',
  role: 'Freelance DevOps & cloud engineer',
  prompt: 'babak@cloud',
  availability: 'taking projects',
  careerStart: { year: 2021, month: 1 },
  codingSince: 2015,
  intro:
    'I build and run cloud infrastructure on AWS and Azure: networks, Kubernetes, deployment pipelines and monitoring, all kept as code. {years}+ years in DevOps, most of it on production systems.',
  workspaces: [
    { id: 'home', label: 'home' },
    { id: 'services', label: 'services' },
    { id: 'work', label: 'work' },
    { id: 'contact', label: 'contact' },
  ],
  serviceTags: ['aws', 'network', 'k8s'],
  deployLog: [
    { time: '14:31', stage: 'plan', status: 'ok', detail: '12 to add' },
    { time: '14:32', stage: 'build', status: 'ok', detail: 'image pushed to ECR' },
    { time: '14:32', stage: 'test', status: 'ok', detail: '214 passed' },
    { time: '14:33', stage: 'rollout', status: 'running', detail: '9/12 pods on v42' },
    { time: '14:33', stage: 'observe', status: 'ok', detail: 'p95 84 ms, 0 errors' },
  ],
  services: [
    {
      id: 'cloud',
      title: 'cloud/',
      text: 'AWS accounts and organisations set up from the start: Identity Center, CloudTrail, budgets and cost alerts. Azure and GCP too, and moves between clouds.',
      tools: ['AWS', 'Azure', 'GCP'],
    },
    {
      id: 'network',
      title: 'network/',
      text: 'VPCs and subnets, private endpoints, NAT, DNS, load balancers, WAF and VPN access.',
      tools: ['VPC', 'Route 53', 'ALB', 'AWS WAF', 'Cloudflare'],
    },
    {
      id: 'kubernetes',
      title: 'kubernetes/',
      text: 'EKS clusters, Helm charts and GitOps. Moving services from EC2 to Kubernetes, with autoscaling and load tests.',
      tools: ['EKS', 'ECS', 'Helm', 'Argo CD'],
    },
    {
      id: 'data',
      title: 'data/',
      text: 'Managed databases, caches and queues sized for real load and cost, with replication, backups and restores that are tested.',
      tools: ['RDS', 'DocumentDB', 'ElastiCache', 'MSK', 'S3'],
    },
    {
      id: 'ci-cd',
      title: 'ci-cd/',
      text: 'Pipelines that build, test and deploy on every change, with rollbacks.',
      tools: ['GitHub Actions', 'GitLab CI', 'CodePipeline'],
    },
    {
      id: 'observability',
      title: 'observability/',
      text: 'Metrics, logs, traces and alerts, with dashboards and runbooks.',
      tools: ['CloudWatch', 'Prometheus', 'Grafana', 'OpenTelemetry'],
    },
    {
      id: 'automation',
      title: 'automation/',
      text: 'All of it kept as code, plus small tools for the operations that repeat.',
      tools: ['Terraform', 'Terragrunt', 'Ansible', 'Go', 'Rust', 'Python', 'Bash'],
    },
  ],
  stats: [
    { label: 'concurrent users', value: '200,000', note: 'a chat platform on EKS was built for' },
    { label: 'terraform stacks', value: '25', note: 'checked against live AWS' },
    { label: 'clouds', value: '3', note: 'AWS, Azure and GCP in production' },
    { label: 'in production', value: '{years}+ yrs', note: 'running live systems since 2021' },
  ],
  work: [
    "Moved VERO's chat platform from EC2 to EKS, built for 200,000 concurrent users",
    "Resized VERO's chat databases and caches on AWS one at a time, without downtime",
    'Rebuilt an online marketplace on a new AWS account from archived backups, fully in Terraform',
    'Set up a multi-account AWS organisation in Terraform and Terragrunt',
    'Checked 25 Terraform stacks against live AWS and fixed the drift step by step',
    'Moved a SaaS platform from GCP to Azure with Terraform, including mail and monitoring',
    'Wrote a Rust service that keeps a pool of ready Azure VMs, with failover and daily snapshots',
    'Migrated 18 TB of S3-compatible object storage',
  ],
  experience: [
    { period: '2024 – now', role: 'Freelance DevOps & cloud engineer', org: 'VERO and other clients' },
    { period: '2024', role: 'DevOps engineer / consultant', org: 'DevOpsYar' },
    { period: '2023 – 2024', role: 'DevOps engineer', org: 'Mihan Insurance' },
    { period: '2020 – 2023', role: 'System administrator / DevOps engineer', org: 'YarHIS' },
    { period: '2015 – 2020', role: 'Software developer', org: 'Idea System Processing' },
  ],
};
