import type { Phase } from '../data/network';

interface AiExplanationProps {
  phase: Phase;
  confidence: number;
  alertCount: number;
  noiseReducedTo: number;
}

export function AiExplanation({ phase, confidence, alertCount, noiseReducedTo }: AiExplanationProps) {
  const getExplanation = (): { title: string; body: string } => {
    switch (phase) {
      case 'normal':
      case 'healthy':
        return {
          title: 'MONITORING',
          body: 'All telemetry streams nominal. Correlation engine standing by. No anomalies detected across 18 network elements.',
        };
      case 'storm':
        return {
          title: 'ALERT INGESTION',
          body: `Receiving ${alertCount.toLocaleString()} raw alerts across physical, network, access, and service layers. Deduplication and temporal clustering active to separate cause from symptom noise.`,
        };
      case 'correlating':
        return {
          title: 'CORRELATION',
          body: `Cross-layer topology correlation reduced ${alertCount.toLocaleString()} alerts to ${noiseReducedTo} correlated events. Causal graph traversal identifies shared dependency path rooted at FIB-MUM-A.`,
        };
      case 'rootcause':
        return {
          title: 'ROOT CAUSE ISOLATION',
          body: `Causal analysis converged on ER-MUM-01 uplink failure (FIB-MUM-A fiber cut). ${confidence}% confidence based on 4 independent evidence streams: OSPF loss, BGP drop, optical power drift, and packet loss pattern. ${noiseReducedTo} incident identified from ${alertCount.toLocaleString()} alerts.`,
        };
      case 'rerouting':
        return {
          title: 'DYNAMIC REROUTING',
          body: 'Traffic engineering engine activated alternate path via CR-MUM-02. Convergence in progress. OSPF/BGP reconverging across affected segments.',
        };
      case 'runbook':
        return {
          title: 'RUNBOOK EXECUTION',
          body: 'RB-014 (Uplink Recovery) matched with 94% similarity score. Tier-1 automated steps safe for execution. Engineer approval recommended for BGP restart on core router.',
        };
      case 'recovering':
        return {
          title: 'RECOVERY VERIFICATION',
          body: 'Recovery wave propagating through dependency chain. Verifying traffic restoration at each layer: fiber → core → aggregation → access → service → customer.',
        };
      default:
        return { title: 'IDLE', body: 'Standing by.' };
    }
  };

  const { title, body } = getExplanation();

  return (
    <div
      style={{
        background: 'var(--panel)',
        padding: '1.1em 1.2em',
        borderTop: '1px solid var(--panel-line)',
      }}
    >
      <h3
        style={{
          fontSize: '0.68rem',
          letterSpacing: '0.16em',
          color: 'var(--ink-2)',
          fontWeight: 700,
          marginBottom: '0.9em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>AI EXPLANATION</span>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: phase === 'normal' || phase === 'healthy' ? 'var(--ok)' : 'var(--fiber)',
            boxShadow: `0 0 8px ${phase === 'normal' || phase === 'healthy' ? 'var(--ok)' : 'var(--fiber)'}`,
          }}
        />
      </h3>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.72rem',
          color: 'var(--fiber)',
          fontWeight: 700,
          marginBottom: '0.5em',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      <p style={{ fontSize: '0.78rem', lineHeight: 1.55, color: 'var(--ink-1)' }}>{body}</p>
    </div>
  );
}
