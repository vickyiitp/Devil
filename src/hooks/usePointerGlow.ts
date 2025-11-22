import { useState, useCallback } from 'react';
import React from 'react';

export const usePointerGlow = (): [React.CSSProperties, (e: React.MouseEvent) => void] => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const style: React.CSSProperties = {
    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, 
      rgba(255, 0, 60, 0.15), 
      transparent 80%)`,
    pointerEvents: 'none',
  };

  return [style, handleMouseMove];
};
