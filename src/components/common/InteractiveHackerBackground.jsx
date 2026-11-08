import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function InteractiveHackerBackground() {
  const canvasRef = useRef(null);
  const { currentTheme, motionEnabled } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates
    const mouse = { x: -1000, y: -1000, active: false, idleTimeout: null };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      clearTimeout(mouse.idleTimeout);
      mouse.idleTimeout = setTimeout(() => {
        mouse.active = false;
      }, 3000);
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particle Setup
    const PARTICLE_COUNT = Math.min(80, Math.floor((width * height) / 18000));
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 1.6 + 1.2
    }));

    // Convert hex accent to rgb for dynamic alpha
    const hexToRgb = (hex) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map((x) => x + x).join('');
      const num = parseInt(c, 16);
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    };

    const rgb = hexToRgb(currentTheme.accent);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Soft Cursor Spotlight / Flashlight
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const glowRadius = 380;
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
        grad.addColorStop(0, `rgba(${rgb}, 0.08)`);
        grad.addColorStop(0.5, `rgba(${rgb}, 0.03)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (motionEnabled) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Mouse magnetic interaction
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              // Draw line to cursor
              const alpha = (1 - dist / 160) * 0.45;
              ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();

              // Subtle magnetic attraction
              p.x += (dx / dist) * 0.25;
              p.y += (dy / dist) * 0.25;
            }
          }
        }

        // Particle node
        ctx.fillStyle = `rgba(${rgb}, 0.65)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Inter-particle constellation connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.22;
            ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      if (motionEnabled) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mouse.idleTimeout);
    };
  }, [currentTheme, motionEnabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}
