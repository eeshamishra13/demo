import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EVIDENCE_SOURCES,
  LINKS,
  ROOT_CAUSE_ID,
  SWITCH_GROUPS,
  getCssVar,
  statusColor,
  type NetworkNode,
  type Phase,
} from '../data/network';
interface TopologyCanvasProps {
  nodes: NetworkNode[];
  phase: Phase;
  activeLayer: string;
  width: number;
  height: number;
}

interface Packet {
  t: number;
  speed: number;
}

interface PacketLink {
  a: string;
  b: string;
  packets: Packet[];
}

function makePacketPool(): PacketLink[] {
  return LINKS.map(([a, b]) => ({
    a,
    b,
    packets: [0.1, 0.4, 0.7].map((o) => ({
      t: o,
      speed: 0.0028 + Math.random() * 0.001,
    })),
  }));
}

const nodeById = (nodes: NetworkNode[]): Record<string, NetworkNode> =>
  Object.fromEntries(nodes.map((n) => [n.id, n]));

interface HoverInfo {
  x: number;
  y: number;
  node: NetworkNode;
}

export function TopologyCanvas({ nodes, phase, activeLayer, width, height }: TopologyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const packetLinksRef = useRef<PacketLink[]>(makePacketPool());
  const animRef = useRef<number>(0);
  const lastTRef = useRef(performance.now());
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      opts: { minimap?: boolean; dt: number },
    ) => {
      const nb = nodeById(nodes);
      const activeGroup = SWITCH_GROUPS[activeLayer] || null;
      ctx.clearRect(0, 0, w, h);

      // Draw links
      LINKS.forEach(([a, b]) => {
        const na = nb[a];
        const nb2 = nb[b];
        if (!na || !nb2) return;
        const x1 = na.fx * w;
        const y1 = na.fy * h;
        const x2 = nb2.fx * w;
        const y2 = nb2.fy * h;
        const isRootLink = (a === ROOT_CAUSE_ID || b === ROOT_CAUSE_ID) && phase !== 'normal' && phase !== 'healthy';
        let alpha = 0.34;
        if (activeGroup && !(activeGroup.includes(na.layer) && activeGroup.includes(nb2.layer)))
          alpha = 0.06;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isRootLink ? getCssVar('--crit') : getCssVar('--panel-line');
        ctx.globalAlpha = isRootLink ? 0.9 : alpha;
        ctx.lineWidth = isRootLink ? 2 : 1;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Draw packets
  const blockedPhases: Phase[] = ['storm', 'correlating', 'rootcause'];
      if (!opts.minimap && phase !== 'storm' && phase !== 'healthy') {
        packetLinksRef.current.forEach((pl) => {
          const na = nb[pl.a];
          const nb2 = nb[pl.b];
          if (!na || !nb2) return;
          const blocked = pl.a === ROOT_CAUSE_ID && blockedPhases.includes(phase);
          if (blocked) return;
          pl.packets.forEach((p) => {
            p.t += p.speed * (opts.dt || 16);
            if (p.t > 1) p.t = 0;
            const x = na.fx * w + (nb2.fx - na.fx) * w * p.t;
            const y = na.fy * h + (nb2.fy - na.fy) * h * p.t;
            ctx.beginPath();
            ctx.arc(x, y, opts.minimap ? 1 : 1.8, 0, Math.PI * 2);
            ctx.fillStyle = getCssVar('--signal');
            ctx.globalAlpha = 0.85;
            ctx.fill();
          });
        });
        ctx.globalAlpha = 1;
      }

      // Evidence convergence lines during rootcause
      if (phase === 'rootcause' && !opts.minimap) {
        const target = nb[ROOT_CAUSE_ID];
        if (target) {
          EVIDENCE_SOURCES.forEach(() => {
            EVIDENCE_SOURCES.forEach((id) => {
              const n = nb[id];
              if (!n) return;
              ctx.beginPath();
              ctx.moveTo(n.fx * w, n.fy * h);
              ctx.lineTo(target.fx * w, target.fy * h);
              ctx.strokeStyle = getCssVar('--fiber');
              ctx.globalAlpha = 0.5;
              ctx.lineWidth = 1.4;
              ctx.setLineDash([2, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
            });
          });
          ctx.globalAlpha = 1;
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        const x = n.fx * w;
        const y = n.fy * h;
        const r = opts.minimap ? 2.4 : n.kind === 'fiber' ? 5 : 7;
        const dimmed = activeGroup ? !activeGroup.includes(n.layer) : false;
        const pulseR = r + Math.sin(n.pulse) * (n.status === 'critical' ? 2.2 : 1);
        const col = statusColor(n.status);
        ctx.globalAlpha = dimmed ? 0.18 : 1;
        if (!opts.minimap) {
          ctx.beginPath();
          ctx.arc(x, y, pulseR + 6, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.globalAlpha = dimmed ? 0.05 : n.status === 'critical' ? 0.22 : 0.1;
          ctx.fill();
        }
        ctx.globalAlpha = dimmed ? 0.25 : 1;
        ctx.beginPath();
        ctx.arc(x, y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = getCssVar('--bg-1');
        ctx.stroke();
        if (!opts.minimap) {
          ctx.font = '600 9.5px ' + getComputedStyle(document.body).fontFamily.split(',')[0];
          ctx.fillStyle = getCssVar('--ink-2');
          ctx.textAlign = 'center';
          ctx.fillText(n.label, x, y + pulseR + 13);
        }
      });
      ctx.globalAlpha = 1;
    },
    [nodes, phase, activeLayer],
  );

  // Main canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (t: number) => {
      const dt = Math.min(48, t - lastTRef.current);
      lastTRef.current = t;
      draw(ctx, width, height, { dt });
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw, width, height]);

  // Minimap render loop
  useEffect(() => {
    const mini = minimapRef.current;
    if (!mini) return;
    const mctx = mini.getContext('2d');
    if (!mctx) return;

    const miniW = 150;
    const miniH = 96;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mini.width = miniW * dpr;
    mini.height = miniH * dpr;
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let miniAnim = 0;
    const miniLoop = (t: number) => {
      const dt = Math.min(48, t - lastTRef.current);
      draw(mctx, miniW, miniH, { minimap: true, dt });
      miniAnim = requestAnimationFrame(miniLoop);
    };
    miniAnim = requestAnimationFrame(miniLoop);
    return () => cancelAnimationFrame(miniAnim);
  }, [draw]);

  // Mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let hit: NetworkNode | null = null;
    for (const n of nodes) {
      const x = n.fx * width;
      const y = n.fy * height;
      if (Math.hypot(mx - x, my - y) < 12) {
        hit = n;
        break;
      }
    }
    if (hit) {
      setHover({ x: hit.fx * width, y: hit.fy * height, node: hit });
    } else {
      setHover(null);
    }
  };

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width, height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      />
      {/* Minimap */}
      <div
        className="absolute right-4 bottom-4 border overflow-hidden"
        style={{
          width: 150,
          height: 96,
          borderColor: 'var(--panel-line)',
          background: 'rgba(6,10,16,0.7)',
          borderRadius: 2,
        }}
      >
        <span
          className="absolute top-1 left-1.5"
          style={{ fontSize: '0.55rem', letterSpacing: '0.14em', color: 'var(--ink-2)' }}
        >
          MINIMAP
        </span>
        <canvas ref={minimapRef} style={{ width: 150, height: 96 }} />
      </div>
      {/* Tooltip */}
      {hover && (
        <div
          className="absolute pointer-events-none z-15"
          style={{
            left: hover.x + 14,
            top: hover.y - 6,
            opacity: 1,
            background: 'var(--panel)',
            border: '1px solid var(--panel-line)',
            padding: '0.7em 0.9em',
            fontSize: '0.72rem',
            lineHeight: 1.5,
            minWidth: 150,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            transition: 'opacity 0.12s ease',
          }}
        >
          <div style={{ fontFamily: 'var(--mono)', color: 'var(--fiber)', fontWeight: 700, marginBottom: '0.35em', letterSpacing: '0.03em' }}>
            {hover.node.label}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', color: 'var(--ink-1)' }}>
            <span>STATUS</span>
            <b style={{ color: 'var(--ink-0)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{hover.node.status.toUpperCase()}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', color: 'var(--ink-1)' }}>
            <span>LATENCY</span>
            <b style={{ color: 'var(--ink-0)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
              {hover.node.status === 'critical' ? '—' : Math.round(8 + Math.random() * 10) + 'ms'}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', color: 'var(--ink-1)' }}>
            <span>TRAFFIC</span>
            <b style={{ color: 'var(--ink-0)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
              {hover.node.status === 'critical' ? '0 Gbps' : (2 + Math.random() * 3).toFixed(1) + ' Gbps'}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', color: 'var(--ink-1)' }}>
            <span>ALERTS</span>
            <b style={{ color: 'var(--ink-0)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
              {hover.node.status === 'critical' ? 3 + Math.floor(Math.random() * 4) : hover.node.status === 'degraded' ? 1 : 0}
            </b>
          </div>
        </div>
      )}
    </div>
  );
}
