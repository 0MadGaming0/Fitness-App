/**
 * Confetti.jsx — A lightweight, high-performance HTML5 Canvas confetti generator.
 * Zero external dependencies. Renders colorful cascading particles.
 */
import { useEffect, useRef } from 'react';

export default function Confetti({ active = false, duration = 4000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      '#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#22d3ee'
    ];

    const particleCount = 140;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      r: Math.random() * 6 + 4,
      d: Math.random() * particleCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      speedY: Math.random() * 3 + 2,
    }));

    let startTime = Date.now();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speedY;
        p.x += Math.sin(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

        // Draw particle
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      // Recirculate falling particles if within duration
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        particles.forEach((p) => {
          if (p.y > height) {
            p.x = Math.random() * width;
            p.y = -20;
            p.speedY = Math.random() * 3 + 2;
          }
        });
      }

      // Stop animation if particles fall off screen after duration
      const activeParticles = particles.some((p) => p.y <= height);
      if (activeParticles) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
