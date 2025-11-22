import '@react-three/fiber';
import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, RootState } from "@react-three/fiber";
import { Environment, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import * as THREE from "three";

function CentralOrb({ pointer }: { pointer: React.MutableRefObject<{ x: number, y: number }> }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const targetY = (pointer.current?.x ?? 0) * 0.2;
    const targetX = (pointer.current?.y ?? 0) * 0.15;

    if (ref.current) {
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY + 0.25 * Math.sin(t * 0.3), 0.08);
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, 0.08);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, Math.sin(t * 0.6) * 0.18, 0.1);
    }
  });

  return (
    <Sphere ref={ref} args={[1, 128, 128]} scale={1.08} position={[0, -0.15, 0]}>
      <MeshDistortMaterial
        color="#00d1ff"
        emissive="#00d1ff"
        emissiveIntensity={0.45}
        roughness={0.05}
        metalness={0.35}
        speed={0.6}
        distort={0.32}
        opacity={0.95}
        transparent
      />
    </Sphere>
  );
}

function FloatingRings() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.x = Math.sin(t * 0.15) * 0.1 - Math.PI / 2;
      ref.current.rotation.z = Math.cos(t * 0.12) * 0.2;
    }
  });

  return (
    <group ref={ref} position={[0, -0.4, 0]}>
      {[1.45, 1.75].map((radius, idx) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.05, 48, 256]} />
          <meshBasicMaterial
            color={idx === 0 ? "#f6c85f" : "#ff4d8b"}
            transparent
            opacity={idx === 0 ? 0.25 : 0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

function Particles({ count = 400, speed = 0.02 }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime * speed;
    if (ref.current) {
        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            dummy.position.set(
                particles[ix + 0],
                particles[ix + 1] + Math.sin(t + i) * 0.12,
                particles[ix + 2] + Math.cos(t + i * 0.7) * 0.08
            );
            dummy.rotation.y = Math.sin(t + i) * 0.01;
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={ref} count={count}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshBasicMaterial toneMapped={false} color="#00d1ff" transparent opacity={0.9} />
    </instancedMesh>
  );
}

const Hero3D: React.FC<{ className?: string }> = ({ className = "w-full h-[420px]" }) => {
  const pointer = useRef({ x: 0, y: 0 });
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      pointer.current.x = (e.clientX / w - 0.5) * 2;
      pointer.current.y = (e.clientY / h - 0.5) * -2;
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className={`${className} relative`}>
      <Canvas
        shadows
        camera={{ position: [0, 0.6, 3.5], fov: 40 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <hemisphereLight args={["#ffffff", "#0b1220", 0.2]} />
          <directionalLight position={[5, 6, 2]} intensity={1.2} color="#00d1ff" />
          <directionalLight position={[-5, 2, -6]} intensity={0.6} color="#f6c85f" />

          <Environment preset="city" />

          <CentralOrb pointer={pointer} />
          <FloatingRings />

          <Particles count={300} speed={0.03} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#060718" roughness={1} metalness={0} />
          </mesh>

          {!prefersReduced && (
            <EffectComposer>
              <DepthOfField focusDistance={0.04} focalLength={0.8} bokehScale={4} />
              <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
              <Vignette eskil={false} offset={0.3} darkness={0.85} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Hero3D;