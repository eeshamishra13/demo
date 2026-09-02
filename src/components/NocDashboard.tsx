import { useEffect, useState } from 'react';
import { TopologyCanvas } from './TopologyCanvas';
import { EventLog } from './EventLog';
import { EscalationTimeline } from './EscalationTimeline';
import { RunbookPanel } from './RunbookPanel';
import { NetworkHealth } from './NetworkHealth';
import { PredictiveChart } from './PredictiveChart';
import { MttrBars } from './MttrBars';
import { FinancialImpact } from './FinancialImpact';
import { AiExplanation } from './AiExplanation';
import { LAYER_NAMES, type Phase } from '../data/network';
import type { SimState } from '../hooks/useSimulation';

interface NocDashboardProps {
  state: SimState;
  onSimulate: () => void;
  onExecute: () => void;
  onApproval: () => void;
  onReset: () => void;
  clockDisplay: string;
}

const phaseLabels: Record<Phase, { text: string; cls: string }> = {
  normal: { text: 'NORMAL OPERATIONS', cls: 'state-normal' },
  storm: { text: 'ALERT STORM', cls: 'state-alert' },
  correlating: { text: 'CORRELATING SIGNALS', cls: 'state-working' },
  rootcause: { text: 'ROOT CAUSE IDENTIFIED', cls: 'state-working' },
  rerouting: { text: 'DYNAMIC REROUTING', cls: 'state-working' },
  runbook: { text: 'RUNBOOK IN PROGRESS', cls: 'state-working' },
  recovering: { text: 'RECOVERING', cls: 'state-working' },
  healthy: { text: 'NETWORK RESTORED', cls: 'state-normal' },
};

export function NocDashboard({
  state,
  onSimulate,
  onExecute,
  onApproval,
  onReset,
  clockDisplay,
}: NocDashboardProps) {
  const [activeLayer, setActiveLayer] = useState('all');
  const [topoWidth, setTopoWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('topo-container');
      if (container) {
        setTopoWidth(container.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const phaseInfo = phaseLabels[state.phase] || phaseLabels.normal;
  const isHealthy = state.phase === 'normal' || state.phase === 'healthy';
  const isCritical = state.phase === 'storm' || state.phase === 'rootcause';

  const layerChips = [
    { label: 'FULL TOPOLOGY', value: 'all' },
    { label: 'PHYSICAL', value: '0' },
    { label: 'CORE', value: '1' },
    { label: 'ACCESS', value: '2' },
    { label: 'SERVICE', value: '3' },
    { label: 'CUSTOMER IMPACT', value: '4' },
  ];

  const netHealthColor = isHealthy ? 'var(--ok)' : isCritical ? 'var(--crit)' : 'var(--amber)';
  const netHealthText = isHealthy ? 'NETWORK HEALTHY' : isCritical ? 'NETWORK CRITICAL' : 'NETWORK DEGRADED';

  const commandStripActive = state.phase !== 'normal' && state.phase !== 'healthy';

  return (
    <section style={{ position: 'relative', zIndex: 2, background: 'var(--bg-1)', borderTop: '1px solid var(--panel-line)' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9em 1.6em',
          background: 'color-mix(in srgb, var(--bg-1) 88%, transparent)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--panel-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          <span className="font-serif" style={{ fontSize: '1.05rem', letterSpacing: '0.02em' }}>
            <b style={{ color: 'var(--fiber)', fontWeight: 600 }}>BharatNet</b> NOC
          </span>
          <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--ink-2)', letterSpacing: '0.03em' }}>
            {clockDisplay}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em' }}>
          <span
            style={{
              padding: '0.45em 0.9em',
              borderRadius: 20,
              fontSize: '0.66rem',
              letterSpacing: '0.1em',
              fontWeight: 600,
              border: `1px solid ${netHealthColor}`,
              color: netHealthColor,
            }}
          >
            {netHealthText}
          </span>
        </div>
      </div>

      {/* Command strip */}
      <div
        style={{
          maxHeight: commandStripActive ? 120 : 0,
          opacity: commandStripActive ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.5s ease, opacity 0.5s ease',
          borderBottom: commandStripActive ? '1px solid var(--panel-line)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '2.4em',
            flexWrap: 'wrap',
            padding: '0.9em 1.6em',
            background: 'linear-gradient(90deg, rgba(239,91,91,0.08), transparent 60%)',
            borderLeft: '3px solid var(--crit)',
          }}
        >
          <StripItem label="SEVERITY" value="SEV-1" valueClass="sev1" />
          <StripItem label="INCIDENT" value="MUMBAI FIBER CUT" />
          <StripItem
            label="ROOT CAUSE"
            value={state.confidence > 0 ? 'ER-MUM-01 UPLINK' : '—'}
          />
          <StripItem
            label="CONFIDENCE"
            value={state.confidence > 0 ? `${state.confidence}%` : '—'}
            valueClass="confidence"
          />
          <StripItem
            label="AFFECTED"
            value={state.blastSet.size > 0 ? `${state.blastSet.size + 3} DEVICES` : '—'}
          />
          <StripItem
            label="IMPACT"
            value={state.financialRate > 0 ? `₹${state.financialRate.toLocaleString('en-IN')}/sec` : '—'}
          />
        </div>
      </div>

      {/* Layer switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.4em',
          padding: '1em 1.6em',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--panel-line)',
        }}
      >
        {layerChips.map((chip) => (
          <button
            key={chip.value}
            onClick={() => setActiveLayer(chip.value)}
            style={{
              padding: '0.5em 1em',
              border: `1px solid ${activeLayer === chip.value ? 'var(--fiber)' : 'var(--panel-line)'}`,
              background: activeLayer === chip.value ? 'var(--fiber)' : 'var(--panel)',
              color: activeLayer === chip.value ? 'var(--bg-0)' : 'var(--ink-1)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              fontWeight: 600,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1px',
          background: 'var(--panel-line)',
        }}
      >
        {/* Topology */}
        <div id="topo-container" style={{ position: 'relative', background: 'var(--bg-1)', minHeight: 640 }}>
          <div style={{ position: 'absolute', left: 16, top: 16, display: 'flex', gap: '0.6em', flexWrap: 'wrap', zIndex: 5 }}>
            <span
              style={{
                padding: '0.45em 0.9em',
                borderRadius: 20,
                fontSize: '0.66rem',
                letterSpacing: '0.1em',
                fontWeight: 600,
                border: `1px solid ${
                  phaseInfo.cls === 'state-normal'
                    ? 'var(--ok)'
                    : phaseInfo.cls === 'state-alert'
                      ? 'var(--crit)'
                      : 'var(--amber)'
                }`,
                color:
                  phaseInfo.cls === 'state-normal'
                    ? 'var(--ok)'
                    : phaseInfo.cls === 'state-alert'
                      ? 'var(--crit)'
                      : 'var(--amber)',
                background: 'rgba(6,10,16,0.6)',
              }}
            >
              {phaseInfo.text}
            </span>
            {state.phase === 'normal' || state.phase === 'healthy' ? (
              <button
                onClick={onSimulate}
                disabled={state.phase !== 'normal' && state.phase !== 'healthy'}
                style={{
                  padding: '0.45em 0.9em',
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  border: '1px solid var(--fiber)',
                  background: 'var(--fiber)',
                  color: '#04120f',
                  cursor: state.phase === 'normal' || state.phase === 'healthy' ? 'pointer' : 'not-allowed',
                  opacity: state.phase === 'normal' || state.phase === 'healthy' ? 1 : 0.5,
                }}
              >
                Simulate: Mumbai Fiber Cut
              </button>
            ) : null}
            {state.phase === 'healthy' && (
              <button
                onClick={onReset}
                style={{
                  padding: '0.45em 0.9em',
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  border: '1px solid var(--panel-line)',
                  background: 'transparent',
                  color: 'var(--ink-0)',
                  cursor: 'pointer',
                }}
              >
                Reset Network
              </button>
            )}
          </div>

          {/* Layer labels on the left side */}
          {LAYER_NAMES.map((name, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 8,
                top: `${0.08 + (i / 5) * 0.84 * (640 / 640)}`,
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                color: 'var(--ink-2)',
                fontWeight: 600,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                pointerEvents: 'none',
                opacity: 0.6,
              }}
            >
              {name}
            </div>
          ))}

          <TopologyCanvas
            nodes={state.nodes}
            phase={state.phase}
            activeLayer={activeLayer}
            width={topoWidth}
            height={640}
          />
        </div>

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--panel-line)' }}>
          <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em' }}>
            <h3 style={panelHeadingStyle}>
              <span>NETWORK EVENT LOG</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 8px var(--ok)' }} />
            </h3>
            <EventLog log={state.log} />
          </div>
          <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em' }}>
            <h3 style={panelHeadingStyle}>
              <span>ESCALATION TIMELINE</span>
            </h3>
            <EscalationTimeline currentStep={state.timelineStep} />
          </div>
          <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em' }}>
            <h3 style={panelHeadingStyle}>
              <span>RUNBOOK</span>
            </h3>
            <RunbookPanel
              phase={state.phase}
              runbookActive={state.runbookActive}
              runbookStep={state.runbookStep}
              onExecute={onExecute}
              onApproval={onApproval}
            />
          </div>
        </div>
      </div>

      {/* AI Explanation full-width */}
      <AiExplanation
        phase={state.phase}
        confidence={state.confidence}
        alertCount={state.alertCount}
        noiseReducedTo={state.noiseReducedTo}
      />

      {/* Bottom strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'var(--panel-line)',
        }}
      >
        <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em', minHeight: 170 }}>
          <h3 style={panelHeadingStyle}>
            <span>FINANCIAL IMPACT</span>
          </h3>
          <FinancialImpact
            rate={state.financialRate}
            total={state.financialTotal}
            frozen={state.frozen}
            phase={state.phase}
          />
        </div>
        <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em', minHeight: 170 }}>
          <h3 style={panelHeadingStyle}>
            <span>PREDICTIVE FAILURE — ER-MUM-01 OPTICAL POWER</span>
          </h3>
          <PredictiveChart progress={state.predictiveProgress} />
          <div style={{ fontSize: '0.68rem', color: 'var(--ink-2)', letterSpacing: '0.05em', marginTop: '0.3em' }}>
            {state.predictiveProgress === 0
              ? state.phase === 'healthy'
                ? 'Signal restored to nominal'
                : 'Signal nominal'
              : state.predictiveProgress < 1
                ? 'Optical power drifting on ER-MUM-01 uplink'
                : 'Failure threshold crossed — matches incident timeline'}
          </div>
        </div>
        <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em', minHeight: 170 }}>
          <h3 style={panelHeadingStyle}>
            <span>MTTR — MANUAL vs AI-ASSISTED</span>
          </h3>
          <MttrBars active={state.mttrActive || state.phase === 'rootcause' || state.phase === 'rerouting' || state.phase === 'runbook' || state.phase === 'recovering' || state.phase === 'healthy'} />
        </div>
        <div style={{ background: 'var(--panel)', padding: '1.1em 1.2em', minHeight: 170 }}>
          <h3 style={panelHeadingStyle}>
            <span>NETWORK HEALTH</span>
          </h3>
          <NetworkHealth nodes={state.nodes} phase={state.phase} />
        </div>
      </div>

      <footer
        style={{
          textAlign: 'center',
          padding: '3em 1em',
          color: 'var(--ink-2)',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
        }}
      >
        BHARATNET AIOPS NOC COMMANDER — SIMULATED TELEMETRY, ILLUSTRATIVE PROTOTYPE
      </footer>
    </section>
  );
}

const panelHeadingStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  letterSpacing: '0.16em',
  color: 'var(--ink-2)',
  fontWeight: 700,
  marginBottom: '0.9em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

function StripItem({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  const color =
    valueClass === 'sev1'
      ? 'var(--crit)'
      : valueClass === 'confidence'
        ? 'var(--fiber)'
        : 'var(--ink-0)';
  const fontWeight = valueClass === 'sev1' ? 700 : 500;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15em' }}>
      <span style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.92rem', color, fontWeight }}>{value}</span>
    </div>
  );
}
