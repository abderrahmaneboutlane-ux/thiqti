"use client";

import { motion } from "framer-motion";

type ThinkingPhase = "analyse" | "recherche" | "classement";

const PHASE_LABELS: Record<ThinkingPhase, string> = {
  analyse: "Analyse de votre demande",
  recherche: "Recherche en cours",
  classement: "Classement des résultats",
};

interface ThinkingWavesProps {
  phase?: ThinkingPhase;
  progress?: number;
}

export default function ThinkingWaves({ phase = "analyse", progress }: ThinkingWavesProps) {
  const dots = phase === "analyse" ? 2 : phase === "recherche" ? 3 : 4;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-6 items-center gap-1">
        {Array.from({ length: dots }).map((_, i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-brand-400"
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500">
          {PHASE_LABELS[phase]}
        </span>
        {progress !== undefined && (
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
