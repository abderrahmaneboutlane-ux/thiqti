"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function Trophy() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.02;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh} scale={1.5}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} envMapIntensity={2} />
      </mesh>
    </Float>
  );
}

export default function TopScoreTrophy3D() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} />
        <Environment preset="city" />
        <Trophy />
      </Canvas>
    </div>
  );
}
