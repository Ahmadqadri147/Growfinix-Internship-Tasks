import { useRef, useState } from "react";
import * as THREE from "three";

type SeatTier3D = "SILVER" | "GOLD" | "DIAMOND" | "VIP";

interface LuxurySeatProps {
  tier: SeatTier3D;
  selected?: boolean;
  onClick?: () => void;
  position?: [number, number, number];
}

const TIER_COLORS: Record<SeatTier3D, string> = {
  SILVER: "#9CA3AF",
  GOLD: "#D4AF37",
  DIAMOND: "#93C5FD",
  VIP: "#C084FC",
};

export default function LuxurySeat({
  tier,
  selected = false,
  onClick,
  position = [0, 0, 0],
}: LuxurySeatProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = TIER_COLORS[tier];

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <group scale={hovered ? 1.08 : 1}>
        {/* Seat back */}
        <mesh position={[0, 0.2, -0.15]}>
          <boxGeometry args={[0.5, 0.3, 0.1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.3}
            emissive={selected ? color : "#000000"}
            emissiveIntensity={selected ? 0.5 : 0}
          />
        </mesh>
        {/* Seat base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.35]} />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.3}
            emissive={selected ? color : "#000000"}
            emissiveIntensity={selected ? 0.5 : 0}
          />
        </mesh>
        {/* Armrests */}
        <mesh position={[-0.28, 0.1, 0]}>
          <boxGeometry args={[0.05, 0.08, 0.35]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 0.1, 0]}>
          <boxGeometry args={[0.05, 0.08, 0.35]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      {selected && (
        <pointLight position={[0, 0.5, 0]} color={color} intensity={0.8} distance={1} />
      )}
    </group>
  );
}