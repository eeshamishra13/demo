import { useEffect, useRef } from 'react';
import { getCssVar } from '../data/network';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface FiberTrace {
  y: number;
  phase: number;
  speed: number;
  amp: number;
}

export function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fibersRef = useRef<FiberTrace[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const corePulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.parentElement!.clientWidth * dpr;
      canvas.height = canvas.parentElement!.clientHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize fiber traces
    if (fibersRef.current.length === 0) {
      fibersRef.current = Array.from({ length: 5 }, (_, i) => ({
        y: 0.15 + i * 0.18,
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.001,
        amp: 20 + Math.random() * 30,
      }));
    }

    const spawnParticle = (): Particle => {
      const w = canvas.clientWidth;
      return {
        x: Math.random() * w,
        y: -10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.5 + Math.random() * 1.5,
        life: 1,
      };
    };

    let lastT = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(48, t - lastT);
      lastT = t;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      // Grid lines (subtle)
      const gridColor = getCssVar('--grid-line') || 'rgba(95,180,255,0.05)';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Fiber traces (sinusoidal wave lines)
      fibersRef.current.forEach((f) => {
        f.phase += f.speed * dt;
        ctx.beginPath();
        const points = 80;
        for (let i = 0; i <= points; i++) {
          const px = (w * i) / points;
          const py = f.y * h + Math.sin(f.phase + (i / points) * Math.PI * 4) * f.amp;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const fiberColor = getCssVar('--fiber');
        ctx.strokeStyle = fiberColor;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Intelligence core pulse (center)
      corePulseRef.current += 0.02 * (dt / 16);
      const cx = w / 2;
      const cy = h * 0.45;
      const pulse = (Math.sin(corePulseRef.current) + 1) / 2;
      const coreR = 40 + pulse * 20;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR + 60);
      grd.addColorStop(0, getCssVar('--fiber'));
      grd.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.15 + pulse * 0.15;
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR + 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(cx, cy, 4 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = getCssVar('--fiber');
      ctx.fill();

      // Signal waves (concentric rings from core)
      for (let i = 0; i < 3; i++) {
        const ringPhase = (corePulseRef.current + i * 1.2) % 3;
        const ringR = ringPhase * 120 + 40;
        const ringAlpha = Math.max(0, 1 - ringPhase / 3) * 0.25;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = getCssVar('--fiber');
        ctx.globalAlpha = ringAlpha;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Packet particles (falling)
      if (particlesRef.current.length < 30 && Math.random() < 0.3) {
        particlesRef.current.push(spawnParticle());
      }
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.life -= 0.003 * dt;
        if (p.y > h || p.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = getCssVar('--signal');
        ctx.globalAlpha = p.life * 0.7;
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9 }} />;
}
