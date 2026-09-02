import { TIMELINE_STEPS } from '../data/network';

export function EscalationTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9em' }}>
      {TIMELINE_STEPS.map((s, i) => {
        const done = i <= currentStep;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.8em',
              opacity: done ? 1 : 0.3,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: done ? 'var(--fiber)' : 'var(--ink-2)',
                marginTop: '0.3em',
                flexShrink: 0,
                boxShadow: done ? '0 0 8px var(--fiber)' : 'none',
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
              }}
            />
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.66rem', color: 'var(--ink-2)' }}>{s.t}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-0)', marginTop: '0.1em' }}>{s.l}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
