import { useEffect, useRef } from "react";

/**
 * NetworkVisualization
 * A lightweight canvas animation of the student ↔ company placement ecosystem.
 * - Pure canvas (no WebGL/three.js), capped DPR, rAF with cleanup.
 * - Pauses automatically when the tab is hidden or the user prefers reduced motion.
 * - Degrades to a static frame on touch / low-power devices.
 */
const NetworkVisualization = ({ className = "", density = 1 }) => {
  const canvasRef = useRef(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let nodes = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches || false;
    const targetNodes = Math.round((isCoarse ? 16 : 30) * density);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      nodes = Array.from({ length: targetNodes }, (_, i) => {
        const isStudent = i % 3 !== 0; // 2:1 student:company mix
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: isStudent ? 2.6 : 3.6,
          student: isStudent,
          pulse: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height);

      // Connections: students → companies
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          if (a.student === b.student) continue; // only student↔company edges
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.32;
            ctx.strokeStyle = a.student
              ? `rgba(139, 92, 246, ${alpha})`
              : `rgba(56, 189, 248, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const glow = 0.55 + 0.45 * Math.sin(t * 0.0016 + n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (1.6 + glow * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = n.student
          ? `rgba(129, 140, 248, ${0.10 + glow * 0.08})`
          : `rgba(56, 189, 248, ${0.10 + glow * 0.08})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.student ? "#818cf8" : "#38bdf8";
        ctx.shadowColor = n.student ? "rgba(129,140,248,0.9)" : "rgba(56,189,248,0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;
      }
    };

    let last = 0;
    const loop = (t) => {
      if (t - last > 33) {
        step();
        draw(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };

    const handleMouse = (e) => {
      // gentle parallax — shift the scene opposite the pointer
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      ctx.setTransform(dpr, 0, 0, dpr, px * 14, py * 10);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduceMotion || isCoarse) {
      draw(0); // static frame
    } else {
      raf = requestAnimationFrame(loop);
      canvas.addEventListener("mousemove", handleMouse);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, reduceMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default NetworkVisualization;
