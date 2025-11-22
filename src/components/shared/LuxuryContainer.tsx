
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

type Variant = 'hero' | 'showcase' | 'service';

interface LuxuryContainerProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  glowColor?: string;
}

export const LuxuryContainer: React.FC<LuxuryContainerProps> = ({
  children,
  variant = 'showcase',
  className = '',
  glowColor = 'rgba(0, 209, 255, 0.7)',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.1 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);
  const scale = useSpring(1, { damping: 20, stiffness: 200 });

  const gradientX = useTransform(mouseX, (val) => (val + 0.5) * 100);
  const gradientY = useTransform(mouseY, (val) => (val + 0.5) * 100);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const { width, height, left, top } = rect;
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };
  
  const baseClasses = "relative rounded-2xl transition-all duration-300 ease-out";
  const variantClasses = {
    hero: "shadow-2xl shadow-devil-black/50",
    showcase: "lux-glass border border-white/10",
    service: "lux-glass border border-white/10 p-8"
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${baseClasses} ${variantClasses[variant]} ${className} group`}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: variant === 'hero' ? 0 : rotateX,
        rotateY: variant === 'hero' ? 0 : rotateY,
        scale: variant === 'hero' ? 1 : scale,
      }}
    >
      <div style={{ transform: variant === 'hero' ? 'none' : 'translateZ(20px)', transformStyle: 'preserve-3d' }} className="h-full relative">
        {children}
      </div>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${gradientX}% ${gradientY}%, ${glowColor}, transparent 80%)`,
        }}
      />
    </motion.div>
  );
};
