export function MttrBars({ active }: { active: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em', marginBottom: '0.6em' }}>
        <span style={{ width: 76, fontSize: '0.66rem', color: 'var(--ink-2)', letterSpacing: '0.06em', flexShrink: 0 }}>MANUAL</span>
        <div style={{ flex: 1, height: 8, background: 'var(--bg-2)', position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: active ? '92%' : '0%',
              background: 'var(--ink-2)',
              transition: 'width 1.1s cubic-bezier(0.2,0.7,0.2,1)',
            }}
          />
        </div>
        <span style={{ width: 52, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--ink-1)' }}>
          {active ? '47 min' : '—'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em', marginBottom: '0.6em' }}>
        <span style={{ width: 76, fontSize: '0.66rem', color: 'var(--ink-2)', letterSpacing: '0.06em', flexShrink: 0 }}>AI-ASSISTED</span>
        <div style={{ flex: 1, height: 8, background: 'var(--bg-2)', position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: active ? '18%' : '0%',
              background: 'var(--fiber)',
              transition: 'width 1.1s cubic-bezier(0.2,0.7,0.2,1)',
            }}
          />
        </div>
        <span style={{ width: 52, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--ink-1)' }}>
          {active ? '9 min' : '—'}
        </span>
      </div>
    </div>
  );
}
