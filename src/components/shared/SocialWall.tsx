import React, { useRef } from 'react';
import { motion, useSpring, useTransform, MotionStyle } from 'framer-motion';
import { GithubIcon, LinkedinIcon, XTwitterIcon } from '../../assets/icons';

const socialLinks = [
  { name: 'GitHub', icon: GithubIcon, url: 'https://github.com/vickyiitp' },
  { name: 'LinkedIn', icon: LinkedinIcon, url: 'https://linkedin.com/in/vickyiitp' },
  { name: 'X', icon: XTwitterIcon, url: 'https://x.com/vickyiitp' },
];

interface SocialWallProps {
    isFooter?: boolean;
}

const MagneticIcon: React.FC<{ social: typeof socialLinks[0]; size: string }> = ({ social, size }) => {
    const ref = useRef<HTMLAnchorElement>(null);

    const mouseX = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
    const mouseY = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };
    
    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const translateX = useTransform(mouseX, [-50, 50], [-5, 5]);
    const translateY = useTransform(mouseY, [-50, 50], [-5, 5]);
    const rotateX = useTransform(mouseY, [-50, 50], [15, -15]);
    const rotateY = useTransform(mouseX, [-50, 50], [-15, 15]);

    return (
        <motion.a
          ref={ref}
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-gray-400 hover:text-devil-red transition-colors duration-300"
          aria-label={social.name}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          // FIX: Replaced `React.CSSProperties` with `MotionStyle` from framer-motion to correctly type motion values and custom properties.
          style={{ 
            x: translateX,
            y: translateY,
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            '--glow-color-1': 'rgba(255, 7, 58, 0.8)'
          } as MotionStyle & { '--glow-color-1': string }}
        >
          <social.icon className={`${size} transition-all duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_var(--glow-color-1)]`} />
        </motion.a>
    )
}

export const SocialWall: React.FC<SocialWallProps> = ({ isFooter = false }) => {
  const iconSize = isFooter ? 'h-6 w-6' : 'h-8 w-8';
  const containerClass = isFooter ? 'flex space-x-6' : 'flex flex-wrap justify-center items-center gap-8 md:gap-12';

  return (
    <div className={containerClass}>
      {socialLinks.map((social) => (
        <MagneticIcon key={social.name} social={social} size={iconSize} />
      ))}
    </div>
  );
};