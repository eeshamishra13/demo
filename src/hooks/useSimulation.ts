import { useCallback, useRef, useState } from 'react';
import {
  CASCADE_EVENTS,
  LAYERED_NODES,
  RECOVERY_ORDER,
  ROOT_CAUSE_ID,
  type NetworkNode,
  type NodeStatus,
  type Phase,
} from '../data/network';

export type LogSev = 'crit' | 'warn' | 'ok' | 'info';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  sev: LogSev;
}

export interface Notification {
  id: number;
  title: string;
  subtitle: string;
  kind: 'incident' | 'rootcause' | 'runbook' | 'recovered';
}

export interface SimState {
  phase: Phase;
  nodes: NetworkNode[];
  confidence: number;
  financialRate: number;
  financialTotal: number;
  frozen: boolean;
  runbookStep: number;
  timelineStep: number;
  blastSet: Set<string>;
  alertCount: number;
  noiseReducedTo: number;
  incidentCount: number;
  log: LogEntry[];
  notifications: Notification[];
  runbookActive: boolean;
  predictiveProgress: number;
  mttrActive: boolean;
  clockSeconds: number;
}

const START_CLOCK = 8 * 3600 + 41 * 60 + 8; // 20:41:08

function makeInitialNodes(): NetworkNode[] {
  return LAYERED_NODES.map((n) => ({ ...n, pulse: Math.random() * Math.PI * 2 }));
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600) % 24;
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)} IST`;
}

function fmtClockNoIst(sec: number): string {
  const h = Math.floor(sec / 3600) % 24;
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const initialState: SimState = {
  phase: 'normal',
  nodes: makeInitialNodes(),
  confidence: 0,
  financialRate: 0,
  financialTotal: 0,
  frozen: true,
  runbookStep: -1,
  timelineStep: -1,
  blastSet: new Set(),
  alertCount: 0,
  noiseReducedTo: 0,
  incidentCount: 0,
  log: [],
  notifications: [],
  runbookActive: false,
  predictiveProgress: 0,
  mttrActive: false,
  clockSeconds: START_CLOCK,
};

export function useSimulation() {
  const [state, setState] = useState<SimState>(initialState);
  const timers = useRef<number[]>([]);
  const logIdRef = useRef(0);
  const notifIdRef = useRef(0);
  const runningRef = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  const addLog = useCallback((message: string, sev: LogSev) => {
    setState((s) => {
      logIdRef.current += 1;
      const entry: LogEntry = {
        id: logIdRef.current,
        time: fmtClockNoIst(s.clockSeconds),
        message,
        sev,
      };
      const log = [...s.log, entry].slice(-50);
      return { ...s, log };
    });
  }, []);

  const addNotification = useCallback(
    (title: string, subtitle: string, kind: Notification['kind']) => {
      setState((s) => {
        notifIdRef.current += 1;
        const notif: Notification = {
          id: notifIdRef.current,
          title,
          subtitle,
          kind,
        };
        const notifications = [...s.notifications, notif];
        const t = window.setTimeout(() => {
          setState((prev) => ({
            ...prev,
            notifications: prev.notifications.filter((n) => n.id !== notif.id),
          }));
        }, 4500);
        timers.current.push(t);
        return { ...s, notifications };
      });
    },
    [],
  );

  const setNodeStatus = useCallback((id: string, status: NodeStatus) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, status } : n)),
    }));
  }, []);

  const advanceTimeline = useCallback((i: number) => {
    setState((s) => ({ ...s, timelineStep: Math.max(s.timelineStep, i) }));
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const t = window.setTimeout(fn, delay);
    timers.current.push(t);
  }, []);

  const runSimulation = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    // reset to clean state but keep clock running
    setState((s) => ({
      ...initialState,
      nodes: makeInitialNodes(),
      clockSeconds: s.clockSeconds,
    }));

    const baseDelay = 300;

    addLog('SIMULATION STARTED: MUMBAI FIBER CUT', 'info');

    // STAGE 0: alert storm
    schedule(() => {
      setState((s) => ({ ...s, phase: 'storm', alertCount: 1247, frozen: false, financialRate: 8547 }));
      setNodeStatus(ROOT_CAUSE_ID, 'critical');
      setNodeStatus('CR-MUM-01', 'critical');
      addLog('ER-MUM-01 UPLINK LINK DOWN', 'crit');
      addNotification('INCIDENT DETECTED', 'Alert storm: 1,247 alerts', 'incident');
      advanceTimeline(0);
    }, baseDelay);

    // STAGE 1: cascading alerts
    CASCADE_EVENTS.forEach(([id, status, msg, sev], i) => {
      schedule(() => {
        setNodeStatus(id, status);
        addLog(msg, sev);
        setState((s) => ({
          ...s,
          blastSet: new Set([...s.blastSet, id]),
        }));
      }, baseDelay + 500 + i * 380);
    });

    // STAGE 2: correlation — noise reduction
    const correlationStart = baseDelay + 500 + CASCADE_EVENTS.length * 380 + 400;
    schedule(() => {
      setState((s) => ({
        ...s,
        phase: 'correlating',
        noiseReducedTo: 183,
      }));
      addLog('CORRELATION ENGINE ACTIVATED', 'warn');
      addLog('NOISE REDUCTION: 1,247 alerts → 183 correlated', 'info');
      advanceTimeline(1);
    }, correlationStart);

    schedule(() => {
      addLog('CORRELATION: 183 events → 1 incident', 'info');
    }, correlationStart + 800);

    // STAGE 3: root cause identified
    schedule(() => {
      setState((s) => ({
        ...s,
        phase: 'rootcause',
        confidence: 89,
        incidentCount: 1,
        noiseReducedTo: 1,
      }));
      addLog('ROOT CAUSE IDENTIFIED — ER-MUM-01 UPLINK (FIB-MUM-A)', 'ok');
      addNotification('ROOT CAUSE IDENTIFIED', 'ER-MUM-01 uplink failure — 89% confidence', 'rootcause');
      advanceTimeline(2);
      advanceTimeline(3);
    }, correlationStart + 1200);

    // STAGE 4: rerouting
    const rerouteDelay = correlationStart + 2400;
    schedule(() => {
      setState((s) => ({ ...s, phase: 'rerouting' }));
      addLog('ALTERNATE ROUTE VIA CR-MUM-02 ACTIVATED', 'warn');
      setNodeStatus('CR-MUM-02', 'recovering');
      advanceTimeline(4);
    }, rerouteDelay);

    // STAGE 5: runbook
    schedule(() => {
      setState((s) => ({ ...s, phase: 'runbook', runbookActive: true }));
      addLog('RUNBOOK RB-014 — UPLINK RECOVERY MATCHED', 'ok');
      addNotification('RUNBOOK READY', 'RB-014: Uplink Recovery — awaiting action', 'runbook');
      advanceTimeline(5);
    }, rerouteDelay + 1400);

    // predictive chart animation
    let predT = 0;
    const predTimer = window.setInterval(() => {
      predT += 0.06;
      setState((s) => ({ ...s, predictiveProgress: Math.min(1, predT) }));
      if (predT >= 1) clearInterval(predTimer);
    }, 200);
    timers.current.push(predTimer as unknown as number);
  }, [addLog, addNotification, advanceTimeline, schedule, setNodeStatus]);

  const executeRunbook = useCallback(() => {
    let i = 0;
    const stepEls = () => state.nodes;
    void stepEls;

    const next = () => {
      setState((s) => {
        if (i > 0) {
          addLog(`RUNBOOK STEP ${String(i).padStart(2, '0')}: COMPLETE`, 'ok');
        }
        if (i >= 5) {
          return { ...s, phase: 'recovering', runbookStep: i };
        }
        const stepLabels = [
          'Verify uplink status on ER-MUM-01',
          'Restart BGP session on CR-MUM-01',
          'Verify OSPF adjacency re-establishment',
          'Confirm alternate route via CR-MUM-02',
          'Verify downstream traffic restoration',
        ];
        addLog(`RUNBOOK STEP ${String(i + 1).padStart(2, '0')}: ${stepLabels[i]}`, 'ok');
        return { ...s, runbookStep: i };
      });
      i++;
      if (i <= 5) {
        schedule(next, 950);
      } else {
        // begin recovery
        schedule(() => {
          setState((s) => ({ ...s, phase: 'recovering' }));
          addLog('RECOVERY WAVE INITIATED FROM ER-MUM-01', 'ok');
          advanceTimeline(6);
          RECOVERY_ORDER.forEach((id, idx) => {
            schedule(() => {
              setNodeStatus(id, 'recovering');
              schedule(() => setNodeStatus(id, 'healthy'), 700);
            }, idx * 260);
          });
          const totalRecovery = RECOVERY_ORDER.length * 260 + 700;
          schedule(() => {
            setState((s) => ({
              ...s,
              phase: 'healthy',
              financialRate: 0,
              frozen: true,
              predictiveProgress: 0,
              mttrActive: true,
            }));
            addLog('NETWORK RESTORED — ALL SYSTEMS NOMINAL', 'ok');
            addNotification('NETWORK RECOVERED', 'All systems nominal — MTTR 9 min', 'recovered');
            advanceTimeline(7);
          }, totalRecovery);
        }, 400);
      }
    };
    next();
  }, [addLog, advanceTimeline, schedule, setNodeStatus, state.nodes]);

  const requestApproval = useCallback(() => {
    addLog('MANUAL APPROVAL REQUESTED — ENGINEER NOTIFIED', 'warn');
    schedule(() => {
      addLog('ENGINEER APPROVED — EXECUTING RUNBOOK', 'ok');
      executeRunbook();
    }, 1200);
  }, [addLog, executeRunbook, schedule]);

  const reset = useCallback(() => {
    clearTimers();
    runningRef.current = false;
    setState((s) => ({
      ...initialState,
      nodes: makeInitialNodes(),
      clockSeconds: s.clockSeconds,
    }));
  }, [clearTimers]);

  // Clock ticker
  const tickClock = useCallback(() => {
    setState((s) => ({ ...s, clockSeconds: s.clockSeconds + 1 }));
  }, []);

  return {
    state,
    runSimulation,
    executeRunbook,
    requestApproval,
    reset,
    tickClock,
    fmtClock,
  };
}
