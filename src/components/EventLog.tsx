import { useEffect, useRef } from 'react';
import { type LogEntry } from '../hooks/useSimulation';

export function EventLog({ log }: { log: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  const sevColor = (sev: LogEntry['sev']): string => {
    switch (sev) {
      case 'crit':
        return 'var(--crit)';
      case 'warn':
        return 'var(--amber)';
      case 'ok':
        return 'var(--ok)';
      default:
        return 'var(--ink-1)';
    }
  };

  return (
    <div
      ref={scrollRef}
      style={{
        height: 220,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '0.5em',
      }}
    >
      {log.length === 0 && (
        <div style={{ fontSize: '0.72rem', color: 'var(--ink-2)', fontFamily: 'var(--mono)' }}>
          Awaiting events…
        </div>
      )}
      {[...log].reverse().map((entry) => (
        <div
          key={entry.id}
          className="animate-log-in"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.72rem',
            lineHeight: 1.4,
            display: 'flex',
            gap: '0.7em',
            color: 'var(--ink-1)',
          }}
        >
          <span style={{ color: 'var(--ink-2)', flexShrink: 0 }}>{entry.time}</span>
          <span style={{ color: sevColor(entry.sev) }}>{entry.message}</span>
        </div>
      ))}
    </div>
  );
}
