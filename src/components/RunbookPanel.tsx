import { RUNBOOK_STEPS } from '../data/network';
import type { Phase } from '../data/network';

interface RunbookPanelProps {
  phase: Phase;
  runbookActive: boolean;
  runbookStep: number;
  onExecute: () => void;
  onApproval: () => void;
}

export function RunbookPanel({ phase, runbookActive, runbookStep, onExecute, onApproval }: RunbookPanelProps) {
  if (!runbookActive) {
    return (
      <div>
        <p style={{ fontSize: '0.76rem', color: 'var(--ink-2)' }}>
          {phase === 'normal' || phase === 'healthy'
            ? 'No active runbook. Awaiting root cause.'
            : 'Matching runbook…'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.76rem', color: 'var(--ink-0)', marginBottom: '0.9em' }}>
        RB-014 — UPLINK RECOVERY
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6em', marginBottom: '1em' }}>
        {RUNBOOK_STEPS.map((s, i) => {
          const isComplete = i < runbookStep;
          const isActive = i === runbookStep;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.7em',
                alignItems: 'flex-start',
                fontSize: '0.78rem',
                opacity: isComplete || isActive ? 1 : 0.4,
                color: isComplete ? 'var(--ok)' : isActive ? 'var(--ink-0)' : 'var(--ink-2)',
                transition: 'opacity 0.3s ease, color 0.3s ease',
              }}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--ink-2)', width: '1.4em', flexShrink: 0 }}>
                0{i + 1}
              </span>
              <span>{s}</span>
            </div>
          );
        })}
      </div>
      {runbookStep < 0 && (
        <div style={{ display: 'flex', gap: '0.6em' }}>
          <button
            onClick={onExecute}
            style={{
              flex: 1,
              fontSize: '0.68rem',
              padding: '0.7em 0.8em',
              background: 'var(--fiber)',
              color: '#04120f',
              border: '1px solid var(--fiber)',
              borderRadius: 2,
              fontWeight: 600,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'box-shadow 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 20px rgba(63,214,196,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            Execute Tier 1
          </button>
          <button
            onClick={onApproval}
            style={{
              flex: 1,
              fontSize: '0.68rem',
              padding: '0.7em 0.8em',
              background: 'transparent',
              color: 'var(--ink-0)',
              border: '1px solid var(--panel-line)',
              borderRadius: 2,
              fontWeight: 600,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'border-color 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--fiber)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--panel-line)')}
          >
            Require Human Approval
          </button>
        </div>
      )}
    </div>
  );
}
