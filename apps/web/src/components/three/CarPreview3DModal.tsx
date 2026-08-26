"use client";

import { Suspense, useEffect } from "react";
import { X } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

interface CarPreview3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  carTitle: string;
}

function CarModel() {
  const { scene } = useGLTF('/models/car.glb') as any;
  return (
    <group position={[0, -0.6, 0]} scale={1.2}>
      <primitive object={scene} />
    </group>
  );
}

export default function CarPreview3DModal({ isOpen, onClose, carTitle }: CarPreview3DModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="liquid-glass relative w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/20 bg-white/40 px-6 py-4">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Aperçu 3D : {carTitle}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative h-[60vh] w-full bg-gradient-to-b from-slate-50 to-slate-200/50 cursor-grab active:cursor-grabbing">
              <Canvas shadows dpr={[1, 1.5]} camera={{ position: [4, 2, -5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <Environment preset="city" />
                <Suspense fallback={null}><CarModel /></Suspense>
                <ContactShadows position={[0, -0.6, 0]} opacity={0.5} scale={10} blur={2} far={4} />
                <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} autoRotate autoRotateSpeed={1} />
              </Canvas>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
