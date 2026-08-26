"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float, Html, useProgress, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --- VOITURE 3D RÉELLE ---
function RealCar() {
  // Le modèle Ferrari officiel de threejs (téléchargé localement)
  const { scene } = useGLTF('/models/car.glb') as any;

  // On peut affiner les matériaux si besoin, mais le GLTF contient déjà ses textures
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // On booste un peu les reflets pour le côté premium
        if (child.material) {
          child.material.envMapIntensity = 2;
        }
      }
    });
  }, [scene]);

  // Positionner et réduire un peu le modèle pour qu'il tienne bien dans le Hero
  return (
    <group position={[0, -0.6, 0]} rotation={[0, Math.PI, 0]} scale={1.2}>
      <primitive object={scene} />
    </group>
  );
}

// --- SUIVI SCROLL ---
function ScrollTracker({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1)
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollY(window.scrollY / h);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useFrame((state) => {
    if (!group.current) return;
    
    // Smooth interpolation for scroll
    group.current.rotation.y += (scrollY * Math.PI * 4 - group.current.rotation.y) * 0.1;
    
    // Subtile réaction à la souris pour garder le côté vivant
    const targetX = (state.pointer.x * Math.PI) / 12;
    const targetY = (state.pointer.y * Math.PI) / 24;
    group.current.rotation.z += (targetX - group.current.rotation.z) * 0.05;
    group.current.rotation.x += (-targetY - group.current.rotation.x) * 0.05;
  });

  return (
    <group ref={group} rotation={[0, -Math.PI / 4, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        {children}
      </Float>
    </group>
  );
}

// --- ÉTAT DE CHARGEMENT ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Silhouette de matérialisation */}
        <div className="relative h-24 w-48 overflow-hidden rounded-xl border border-brand-500/30 bg-white/5 backdrop-blur-sm">
          <div 
            className="absolute bottom-0 left-0 h-full bg-brand-500/20 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brand-400">
            {progress.toFixed(0)}%
          </div>
        </div>
      </div>
    </Html>
  );
}

// --- COMPOSANT PRINCIPAL ---
export default function HeroCar3D({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  if (!mounted || reducedMotion) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        {/* Fallback : une simple image statique ou un gradient */}
        <div className="h-64 w-96 rounded-3xl bg-slate-100/50 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
          <span className="text-slate-400 font-bold">Thiqti Auto 3D</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Environment preset="city" />
        
        <Suspense fallback={<Loader />}>
          <ScrollTracker>
            <RealCar />
          </ScrollTracker>
        </Suspense>
        
        <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
