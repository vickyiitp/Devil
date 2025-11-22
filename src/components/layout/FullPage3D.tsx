import '@react-three/fiber';
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, RootState } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

function StarField({ count = 800 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime * 0.02;
    if (ref.current) {
      ref.current.rotation.y = t * 0.05;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} sizeAttenuation color="#0abefc" transparent opacity={0.5} />
    </points>
  );
}

const FullPage3D: React.FC<{ className?: string }> = ({ className = "fixed inset-0 -z-10" }) => {
  const prefersReduced = usePrefersReducedMotion();
  const [isLiteMode, setIsLiteMode] = useState(false);
  
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const conn = (navigator as any).connection || {};
      if (conn.saveData || (conn.effectiveType && /2g|slow-2g/.test(conn.effectiveType))) {
        document.documentElement.classList.add("lite-mode");
        setIsLiteMode(true);
      }
    }
  }, []);

  if (isLiteMode) {
    return <div className={className} style={{ background: "radial-gradient(circle at 10% 20%, rgba(0,209,255,0.06), transparent 10%), radial-gradient(circle at 90% 80%, rgba(246,200,95,0.04), transparent 15%)" }} />;
  }

  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.4} />
        {!prefersReduced && <StarField count={700} />}
      </Canvas>
    </div>
  );
}

export default FullPage3D;