import { useEffect, useRef } from 'react';
import { getCssVar } from '../data/network';

export function PredictiveChart({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = 60;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const x = (w * i) / n;
      const decline = Math.max(0, i / n - (1 - progress * 1.3));
      const y = h * 0.25 + decline * h * 1.6 + Math.sin(i * 0.7) * 1.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = getCssVar(progress > 0.5 ? '--amber' : '--fiber');
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }, [progress]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 60, display: 'block' }} />;
}
