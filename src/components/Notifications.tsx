import type { Notification } from '../hooks/useSimulation';

const kindConfig: Record<Notification['kind'], { color: string; icon: string }> = {
  incident: { color: 'var(--crit)', icon: '!' },
  rootcause: { color: 'var(--fiber)', icon: '◎' },
  runbook: { color: 'var(--amber)', icon: '☰' },
  recovered: { color: 'var(--ok)', icon: '✓' },
};

export function Notifications({ notifications }: { notifications: Notification[] }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6em',
        pointerEvents: 'none',
        maxWidth: 340,
      }}
    >
      {notifications.map((n) => {
        const cfg = kindConfig[n.kind];
        return (
          <div
            key={n.id}
            style={{
              background: 'var(--panel)',
              border: `1px solid ${cfg.color}`,
              borderLeft: `3px solid ${cfg.color}`,
              padding: '0.9em 1.1em',
              borderRadius: 2,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${cfg.color}33`,
              display: 'flex',
              gap: '0.8em',
              alignItems: 'flex-start',
              animation: 'logIn 0.3s ease',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: cfg.color,
                color: 'var(--bg-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {cfg.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ink-0)', letterSpacing: '0.04em' }}>
                {n.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-1)', marginTop: '0.2em' }}>{n.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
