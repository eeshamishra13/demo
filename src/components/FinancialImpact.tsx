import type { Phase } from '../data/network';

interface FinancialImpactProps {
  rate: number;
  total: number;
  frozen: boolean;
  phase: Phase;
}

export function FinancialImpact({ rate, total, frozen, phase }: FinancialImpactProps) {
  const displayRate = frozen && phase !== 'storm' && phase !== 'rootcause' && phase !== 'correlating' ? 0 : rate;
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '1.7rem',
          color: displayRate > 0 ? 'var(--crit)' : 'var(--ok)',
          fontWeight: 600,
          letterSpacing: '0.01em',
        }}
      >
        ₹{Math.round(displayRate).toLocaleString('en-IN')}/sec
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--ink-2)', letterSpacing: '0.05em', marginTop: '0.3em' }}>
        {frozen && phase === 'healthy'
          ? 'Incident resolved — impact stopped'
          : displayRate > 0
            ? `Cumulative impact: ₹${Math.round(total).toLocaleString('en-IN')}`
            : 'No revenue-impacting incident'}
      </div>
    </div>
  );
}
