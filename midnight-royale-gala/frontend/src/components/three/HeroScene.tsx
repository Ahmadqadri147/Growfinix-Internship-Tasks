import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function TorusKnot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.1;
      ref.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />
      <meshStandardMaterial
        color="#D4AF37"
        emissive="#D4AF37"
        emissiveIntensity={0.3}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function Particles() {
  const count = 800;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useEffect(() => {
    if (ref.current) {
      const geom = ref.current.geometry;
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    }
  }, [positions]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      const pos = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += Math.sin(Date.now() * 0.0005 + i) * 0.001;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        color="#D4AF37"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Rings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.03;
    }
  });

  const rings = Array.from({ length: 5 }).map((_, i) => ({
    radius: 2 + i * 0.6,
    speed: 0.2 + i * 0.05,
    offset: i * 0.5,
  }));

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <Float key={i} speed={ring.speed} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh rotation={[Math.PI / 2, 0, ring.offset]}>
            <ringGeometry args={[ring.radius, ring.radius + 0.02, 64]} />
            <meshBasicMaterial
              color="#D4AF37"
              transparent
              opacity={0.15 - i * 0.02}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function MouseTracker({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = mouse.y * 0.1;
      groupRef.current.rotation.y = mouse.x * 0.1;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} color="#D4AF37" intensity={0.6} />
      <directionalLight position={[-5, -5, -5]} color="#D4AF37" intensity={0.2} />
      <MouseTracker>
        <TorusKnot />
        <Rings />
      </MouseTracker>
      <Particles />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.2}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: "linear-gradient(to bottom, #050505, #1a1a1a)" }}
        dpr={[1, 2]}
      >
        <SceneContent />
      </Canvas>
    </motion.div>
  );
}