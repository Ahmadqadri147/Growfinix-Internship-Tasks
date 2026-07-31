import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { cn } from "@/lib/utils";
import LuxurySeat from "./LuxurySeat";

type SeatTier3D = "SILVER" | "GOLD" | "DIAMOND" | "VIP";

interface Seat3D {
  id: string;
  tier: SeatTier3D;
  row: number;
  number: number;
  status: string;
  x: number;
  y: number;
}

interface SeatMap3DProps {
  seats: Seat3D[];
  onSeatSelect?: (seatId: string) => void;
  className?: string;
}

const TIER_DISPLAY: Record<SeatTier3D, { label: string; color: string }> = {
  SILVER: { label: "Silver", color: "#9CA3AF" },
  GOLD: { label: "Gold", color: "#D4AF37" },
  DIAMOND: { label: "Diamond", color: "#93C5FD" },
  VIP: { label: "VIP", color: "#C084FC" },
};

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#0a0a1a"
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}

function GridHelper() {
  return (
    <gridHelper
      args={[20, 20, "#1a1a2e", "#1a1a2e"]}
      position={[0, -0.48, 0]}
    />
  );
}

function Stage() {
  return (
    <mesh position={[0, -0.3, 0]}>
      <boxGeometry args={[12, 0.3, 8]} />
      <meshStandardMaterial
        color="#14142e"
        metalness={0.3}
        roughness={0.6}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} color="#D4AF37" intensity={0.5} />
      <directionalLight position={[-5, 5, -5]} color="#93C5FD" intensity={0.3} />
      <pointLight position={[0, 5, 0]} color="#D4AF37" intensity={0.4} distance={15} />
    </>
  );
}

function Seats({ seats, onSeatSelect }: { seats: Seat3D[]; onSeatSelect?: (id: string) => void }) {
  return (
    <>
      {seats.map((seat) => (
        <LuxurySeat
          key={seat.id}
          tier={seat.tier}
          position={[seat.x, 0, seat.y]}
          selected={seat.status === "selected"}
          onClick={() => onSeatSelect?.(seat.id)}
        />
      ))}
    </>
  );
}

function Legend() {
  const tiers = Object.entries(TIER_DISPLAY) as [SeatTier3D, { label: string; color: string }][];

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
      <div className="flex gap-4 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
        {tiers.map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm border border-white/20"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SeatMap3D({ seats, onSeatSelect, className }: SeatMap3DProps) {
  return (
    <div className={cn("relative h-[500px] w-full overflow-hidden rounded-xl", className)}>
      <Canvas
        camera={{ position: [0, 6, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Lights />
          <Floor />
          <GridHelper />
          <Stage />
          <Seats seats={seats} onSeatSelect={onSeatSelect} />
          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={4}
            maxDistance={14}
          />
        </Suspense>
      </Canvas>
      <Legend />
    </div>
  );
}