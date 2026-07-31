import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
}

export default function ParticleField({
  count = 100,
  color = "#D4AF37",
  size = 0.05,
  spread = 10,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * spread;
    }
    return pos;
  }, [count, spread]);

  const velocities = useMemo(() => {
    return Float32Array.from(
      { length: count },
      () => (Math.random() - 0.5) * 0.005,
    );
  }, [count]);

  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    }
  }, [positions]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3 + 1] += velocities[i];
      if (pos[i3 + 1] > spread / 2) pos[i3 + 1] = -spread / 2;
      if (pos[i3 + 1] < -spread / 2) pos[i3 + 1] = spread / 2;
      pos[i3] += Math.sin(Date.now() * 0.001 + i) * 0.001;
      pos[i3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}