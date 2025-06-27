
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
    shape: string;
  }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#22c55e', '#16a34a', '#15803d', '#f59e0b', '#d97706'];
    const shapes = ['💰', '💵', '💸', '🎉', '✨'];
    
    const newParticles = Array.from({ length: 75 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      y: window.innerHeight / 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8 - 2
      },
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            animationDuration: '1.5s',
            animationDelay: `${Math.random() * 0.5}s`
          }}
        >
          {particle.shape}
        </div>
      ))}
    </div>
  );
};

export default IncomeConfetti;
