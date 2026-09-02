import type { NetworkNode, Phase } from '../data/network';

export function NetworkHealth({ nodes, phase }: { nodes: NetworkNode[]; phase: Phase }) {
  const groupNodes: Record<number, string[]> = {
    0: ['FIB-MUM-A', 'FIB-MUM-B'],
    1: ['CR-MUM-01', 'CS-MUM-01'],
    2: ['ER-MUM-01', 'BSC-MUM-01'],
    3: ['DNS-SVC', 'AUTH-SVC'],
    4: ['CUST-RETAIL'],
  };

  const rankMap: Record<string, number> = {
    healthy: 0,
    recovering: 1,
    degraded: 2,
    critical: 3,
    suppressed: 1,
  };

  const colors = ['var(--ok)', 'var(--signal)', 'var(--amber)', 'var(--crit)'];
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const segments = [0, 1, 2, 3, 4].map((li) => {
    const ids = groupNodes[li];
    const worst = ids.reduce((acc, id) => {
      const n = nodeMap[id];
      if (!n) return acc;
      return Math.max(acc, rankMap[n.status] || 0);
    }, 0);
    return colors[worst] || colors[0];
  });

  const caption =
    phase === 'normal' || phase === 'healthy'
      ? 'All layers nominal'
      : phase === 'storm' || phase === 'rootcause'
        ? 'Critical degradation detected in access & service layers'
        : 'Layers recovering toward nominal state';

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-1)' }}>{caption}</div>
      <div style={{ display: 'flex', height: 10, borderRadius: 1, overflow: 'hidden', marginTop: '0.4em' }}>
        {segments.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c, transition: 'background 0.4s ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5em', fontSize: '0.66rem', color: 'var(--ink-2)' }}>
        <span>Physical</span>
        <span>Network</span>
        <span>Access</span>
        <span>Service</span>
        <span>Customer</span>
      </div>
    </div>
  );
}
