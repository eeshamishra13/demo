// Network topology data model — clean telecom hierarchy (no spider-web)

export type NodeKind = 'fiber' | 'router' | 'switch' | 'edge' | 'bsc' | 'rnc' | 'bts' | 'svc' | 'cust';
export type NodeStatus = 'healthy' | 'critical' | 'degraded' | 'recovering' | 'suppressed';
export type Phase =
  | 'normal'
  | 'storm'
  | 'correlating'
  | 'rootcause'
  | 'rerouting'
  | 'runbook'
  | 'recovering'
  | 'healthy';

export interface NetworkNode {
  id: string;
  label: string;
  layer: number; // 0..5
  kind: NodeKind;
  status: NodeStatus;
  fx: number; // 0..1 x position fraction
  fy: number; // 0..1 y position fraction
  pulse: number;
  affected: boolean;
}

// 6-layer telecom hierarchy: Fiber -> Core -> Aggregation -> Access -> Services -> Customer
export const LAYER_NAMES = [
  'PHYSICAL / FIBER',
  'CORE',
  'AGGREGATION',
  'ACCESS',
  'SERVICES',
  'CUSTOMER IMPACT',
];

export const INITIAL_NODES: NetworkNode[] = [
  // layer 0 — physical fiber
  { id: 'FIB-MUM-A', label: 'FIBER-MUM-A', layer: 0, kind: 'fiber', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'FIB-MUM-B', label: 'FIBER-MUM-B', layer: 0, kind: 'fiber', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'FIB-PUN-A', label: 'FIBER-PUN-A', layer: 0, kind: 'fiber', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  // layer 1 — core routers
  { id: 'CR-MUM-01', label: 'CR-MUM-01', layer: 1, kind: 'router', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'CR-MUM-02', label: 'CR-MUM-02', layer: 1, kind: 'router', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  // layer 2 — aggregation switches
  { id: 'CS-MUM-01', label: 'CS-MUM-01', layer: 2, kind: 'switch', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'CS-MUM-02', label: 'CS-MUM-02', layer: 2, kind: 'switch', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  // layer 3 — access / RAN
  { id: 'ER-MUM-01', label: 'ER-MUM-01', layer: 3, kind: 'edge', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'BSC-MUM-01', label: 'BSC-MUM-01', layer: 3, kind: 'bsc', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'RNC-MUM-01', label: 'RNC-MUM-01', layer: 3, kind: 'rnc', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'BTS-MUM-014', label: 'BTS-MUM-014', layer: 3, kind: 'bts', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'BTS-MUM-022', label: 'BTS-MUM-022', layer: 3, kind: 'bts', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  // layer 4 — services
  { id: 'DNS-SVC', label: 'DNS', layer: 4, kind: 'svc', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'AUTH-SVC', label: 'AUTH', layer: 4, kind: 'svc', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'PAY-SVC', label: 'PAYMENTS', layer: 4, kind: 'svc', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  // layer 5 — customer impact
  { id: 'CUST-RETAIL', label: 'RETAIL SUBSCRIBERS', layer: 5, kind: 'cust', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'CUST-ENT', label: 'ENTERPRISE CUSTOMERS', layer: 5, kind: 'cust', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
  { id: 'CUST-IOT', label: 'IOT / M2M', layer: 5, kind: 'cust', status: 'healthy', fx: 0, fy: 0, pulse: 0, affected: false },
];

// Links use [a, b] node ids. Carefully chosen so connections go downward only
// and do not cross each other (controlled, orthogonal hierarchy).
export const LINKS: [string, string][] = [
  ['FIB-MUM-A', 'CR-MUM-01'],
  ['FIB-MUM-B', 'CR-MUM-02'],
  ['FIB-PUN-A', 'CR-MUM-02'],
  ['CR-MUM-01', 'CS-MUM-01'],
  ['CR-MUM-01', 'CS-MUM-02'],
  ['CR-MUM-02', 'CS-MUM-02'],
  ['CS-MUM-01', 'ER-MUM-01'],
  ['CS-MUM-01', 'BSC-MUM-01'],
  ['CS-MUM-02', 'RNC-MUM-01'],
  ['BSC-MUM-01', 'BTS-MUM-014'],
  ['RNC-MUM-01', 'BTS-MUM-022'],
  ['ER-MUM-01', 'DNS-SVC'],
  ['ER-MUM-01', 'AUTH-SVC'],
  ['CS-MUM-02', 'PAY-SVC'],
  ['DNS-SVC', 'CUST-RETAIL'],
  ['AUTH-SVC', 'CUST-RETAIL'],
  ['AUTH-SVC', 'CUST-ENT'],
  ['PAY-SVC', 'CUST-ENT'],
  ['BTS-MUM-014', 'CUST-RETAIL'],
  ['BTS-MUM-022', 'CUST-IOT'],
];

// Dependency chain rooted at FIB-MUM-A, used for blast radius & evidence convergence.
export const DEPENDENCY_CHAIN = [
  'FIB-MUM-A',
  'CR-MUM-01',
  'CS-MUM-01',
  'CS-MUM-02',
  'ER-MUM-01',
  'BSC-MUM-01',
  'BTS-MUM-014',
  'DNS-SVC',
  'AUTH-SVC',
  'CUST-RETAIL',
];

export const EVIDENCE_SOURCES = ['CR-MUM-01', 'CS-MUM-01', 'CS-MUM-02', 'ER-MUM-01'];

export const ROOT_CAUSE_ID = 'FIB-MUM-A';

// Runbook steps for RB-014
export const RUNBOOK_STEPS = [
  'Verify uplink status on ER-MUM-01',
  'Restart BGP session on CR-MUM-01',
  'Verify OSPF adjacency re-establishment',
  'Confirm alternate route via CR-MUM-02',
  'Verify downstream traffic restoration',
];

export const TIMELINE_STEPS = [
  { t: '+00:00', l: 'Alert detected' },
  { t: '+00:07', l: 'Correlation started' },
  { t: '+00:12', l: 'Root cause identified' },
  { t: '+00:15', l: 'SEV-1 created' },
  { t: '+00:18', l: 'Engineer notified' },
  { t: '+00:24', l: 'Runbook approved' },
  { t: '+00:30', l: 'Recovery initiated' },
  { t: '+00:42', l: 'Network restored' },
];

// Cascade events triggered during the alert storm.
export const CASCADE_EVENTS: [string, NodeStatus, string, 'crit' | 'warn'][] = [
  ['CS-MUM-01', 'critical', 'OSPF NEIGHBOR LOST — CS-MUM-01', 'crit'],
  ['CS-MUM-02', 'degraded', 'BGP SESSION DROPPED — CS-MUM-02', 'warn'],
  ['ER-MUM-01', 'degraded', 'PACKET LOSS DETECTED — ER-MUM-01', 'warn'],
  ['BSC-MUM-01', 'degraded', 'INTERFACE FLAPPING — BSC-MUM-01', 'warn'],
  ['BTS-MUM-014', 'degraded', 'HIGH CPU — BTS-MUM-014', 'warn'],
  ['DNS-SVC', 'degraded', 'SERVICE TIMEOUT — DNS-SVC', 'warn'],
  ['AUTH-SVC', 'critical', 'SERVICE TIMEOUT — AUTH-SVC', 'crit'],
  ['CUST-RETAIL', 'degraded', 'CUSTOMER IMPACT DETECTED — RETAIL', 'crit'],
];

export const RECOVERY_ORDER = [
  'FIB-MUM-A',
  'CR-MUM-01',
  'CS-MUM-01',
  'CS-MUM-02',
  'ER-MUM-01',
  'BSC-MUM-01',
  'BTS-MUM-014',
  'DNS-SVC',
  'AUTH-SVC',
  'CUST-RETAIL',
  'CR-MUM-02',
];

// Layer switcher groupings (switcher index -> topology layer indices)
export const SWITCH_GROUPS: Record<string, number[]> = {
  '0': [0],
  '1': [1, 2],
  '2': [3],
  '3': [4],
  '4': [5],
};

// Compute x,y layout positions (fractions 0..1) for each node based on layer.
export function computeLayout(nodes: NetworkNode[]): NetworkNode[] {
  const marginX = 0.09;
  const marginY = 0.08;
  const usableW = 1 - marginX * 2;
  const usableH = 1 - marginY * 2;
  const rows = 6;
  const byLayer: Record<number, NetworkNode[]> = {};
  nodes.forEach((n) => {
    (byLayer[n.layer] = byLayer[n.layer] || []).push(n);
  });
  Object.keys(byLayer).forEach((liStr) => {
    const li = Number(liStr);
    const arr = byLayer[li];
    const y = marginY + usableH * (li / (rows - 1));
    arr.forEach((n, i) => {
      const x = marginX + usableW * ((i + 1) / (arr.length + 1));
      n.fx = x;
      n.fy = y;
    });
  });
  return nodes;
}

export const LAYERED_NODES = computeLayout(INITIAL_NODES.map((n) => ({ ...n })));

export function statusColor(status: NodeStatus): string {
  const css = getComputedStyle(document.documentElement);
  switch (status) {
    case 'critical':
      return css.getPropertyValue('--crit').trim();
    case 'degraded':
      return css.getPropertyValue('--amber').trim();
    case 'recovering':
      return css.getPropertyValue('--signal').trim();
    case 'suppressed':
      return css.getPropertyValue('--ink-2').trim();
    default:
      return css.getPropertyValue('--fiber').trim();
  }
}

export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
