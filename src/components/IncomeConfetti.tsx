
import { useEffect, useState } from 'react';

interface IncomeConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const IncomeConfetti = ({ trigger, onComplete }: IncomeConfettiProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    velocity: { x: number; y: number };
  }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#22c55e', '#10b981', '#059669', '#047857', '#065f46'];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      y: window.innerHeight / 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 8,
        y: Math.random() * -8 - 4
      }
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-ping"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
};

export default IncomeConfetti;
