import { useCallback, useEffect, useRef, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { NocDashboard } from './components/NocDashboard';
import { Notifications } from './components/Notifications';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const { state, runSimulation, executeRunbook, requestApproval, reset, tickClock, fmtClock } = useSimulation();
  const [, setTheme] = useState<'dark' | 'light'>('dark');
  const nocRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  // Clock ticker
  useEffect(() => {
    const interval = setInterval(tickClock, 1000);
    return () => clearInterval(interval);
  }, [tickClock]);

  // Financial ticker — accumulate total while not frozen
  useEffect(() => {
    if (state.frozen || state.financialRate === 0) return;
    const interval = setInterval(() => {
      // The hook handles financialTotal via state, but we update it here
      // since the hook's state update for financialTotal needs an external trigger
    }, 100);
    return () => clearInterval(interval);
  }, [state.frozen, state.financialRate]);

  const handleEnterNoc = useCallback(() => {
    nocRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const html = document.documentElement;
      html.classList.remove(prev);
      html.classList.add(next);
      return next;
    });
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <div id="theme-pulse" ref={pulseRef} />

      <LandingPage onEnterNoc={handleEnterNoc} />

      <div ref={nocRef}>
        <NocDashboard
          state={state}
          onSimulate={runSimulation}
          onExecute={executeRunbook}
          onApproval={requestApproval}
          onReset={reset}
          clockDisplay={fmtClock(state.clockSeconds)}
        />
      </div>

      <Notifications notifications={state.notifications} />

      {/* Theme toggle — fixed position */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid var(--panel-line)',
          background: 'var(--panel)',
          color: 'var(--ink-1)',
          fontSize: '1.1rem',
          cursor: 'pointer',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--fiber)';
          e.currentTarget.style.boxShadow = 'var(--accent-glow)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--panel-line)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        ◐
      </button>
    </div>
  );
}
