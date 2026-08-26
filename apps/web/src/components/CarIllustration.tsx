"use client";

import { useState, useCallback, useMemo } from "react";

interface CarIllustrationProps {
  make: string;
  model: string;
  className?: string;
}

const BRAND_COLORS: Record<string, { primary: string; accent: string; bg: string }> = {
  Dacia:      { primary: "#00614E", accent: "#00A878", bg: "#E8F5F0" },
  Renault:    { primary: "#FFCC33", accent: "#E6B800", bg: "#FFF8E1" },
  Peugeot:    { primary: "#1F3C73", accent: "#3A6DB5", bg: "#E3ECF7" },
  Toyota:     { primary: "#EB0A1E", accent: "#FF4D5A", bg: "#FDEAEB" },
  Hyundai:    { primary: "#002C5F", accent: "#0066B3", bg: "#E0EAF5" },
  Kia:        { primary: "#05141F", accent: "#1A73E8", bg: "#E8ECEF" },
  Volkswagen: { primary: "#001E50", accent: "#004AAD", bg: "#E0E6F2" },
  BMW:        { primary: "#1C69D4", accent: "#4D9AFF", bg: "#E1ECFB" },
  Mercedes:   { primary: "#333333", accent: "#666666", bg: "#F0F0F0" },
  Ford:       { primary: "#003478", accent: "#0072CE", bg: "#E0EAF5" },
  Nissan:     { primary: "#C3002F", accent: "#E63950", bg: "#FCEAED" },
  Fiat:       { primary: "#8B1F40", accent: "#B84A6C", bg: "#F5E0E8" },
  "Citroën":  { primary: "#6B6E72", accent: "#9CA0A5", bg: "#F0F0F2" },
  Opel:       { primary: "#FFD700", accent: "#FFA500", bg: "#FFFAE0" },
  Honda:      { primary: "#CC0000", accent: "#FF3333", bg: "#FDE0E0" },
  Mazda:      { primary: "#910A2E", accent: "#C41040", bg: "#F5E0E6" },
  BYD:        { primary: "#1A1A1A", accent: "#C2785C", bg: "#F0EDEB" },
  MG:         { primary: "#C8102E", accent: "#FF1744", bg: "#FCEAED" },
  Volvo:      { primary: "#003057", accent: "#0074B7", bg: "#E0EAF2" },
  Jeep:       { primary: "#4A6741", accent: "#6B9E60", bg: "#E8F2E5" },
  Suzuki:     { primary: "#E30613", accent: "#FF4444", bg: "#FDEAEB" },
  Skoda:      { primary: "#4BA82E", accent: "#6DD44A", bg: "#E8F5E3" },
  Seat:       { primary: "#E8173B", accent: "#FF4D63", bg: "#FCEAED" },
  Tesla:      { primary: "#CC0000", accent: "#E63950", bg: "#FDEAEB" },
  DFSK:       { primary: "#003DA5", accent: "#2868C8", bg: "#E0EAF7" },
  Changan:    { primary: "#1B3C87", accent: "#3A6DD9", bg: "#E2EAF7" },
  Chery:      { primary: "#003399", accent: "#3366CC", bg: "#E0E8F7" },
  Geely:      { primary: "#003DA5", accent: "#2868C8", bg: "#E0EAF7" },
  Haval:      { primary: "#003DA5", accent: "#2868C8", bg: "#E0EAF7" },
  Omoda:      { primary: "#C2785C", accent: "#D49A7A", bg: "#F5EDE8" },
  JAC:        { primary: "#C2785C", accent: "#D49A7A", bg: "#F5EDE8" },
};

function getColors(make: string) {
  return BRAND_COLORS[make] || { primary: "#0C4A6E", accent: "#0284C7", bg: "#F0F9FF" };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function getBodyType(make: string, model: string): "sedan" | "suv" | "citadine" | "pickup" {
  const m = (make + " " + model).toLowerCase();
  if (/duster|tucson|sportage|qashqai|tiguan|x1|x3|suv|4x4|2008|3008|kona|stonic|bayon|rav4|cx-30|cx-5|vitara|renegade|xc40|xc60|glory|cs35|cs55|tiggo|coolray|jolion|h6|omoda|zst|mg.?hs|mg.?zs/.test(m)) return "suv";
  if (/sandero|clio|208|picanto|i10|i20|500|citadine|ibiza|corsa|polo|c3|fiesta|swift|mg5|jazz/.test(m)) return "citadine";
  if (/ranger|hilux|pick/.test(m)) return "pickup";
  return "sedan";
}

function drawSedan(colors: { primary: string; accent: string }, id: number): string {
  const yOff = (id % 3) * 5;
  return `
    <g transform="translate(20,${55 + yOff})">
      <!-- Shadow -->
      <ellipse cx="80" cy="100" rx="70" ry="6" fill="rgba(0,0,0,0.12)"/>
      <!-- Body -->
      <path d="M10,72 Q10,65 18,60 L55,42 Q62,35 72,32 L110,30 Q125,30 130,35 L145,55 Q155,60 155,65 L155,78 Q155,82 150,82 L15,82 Q10,82 10,78 Z" fill="${colors.primary}"/>
      <!-- Roof -->
      <path d="M58,42 Q65,28 78,25 L108,24 Q118,24 122,30 L130,40" fill="${colors.primary}" opacity="0.9"/>
      <!-- Windows -->
      <path d="M62,43 Q68,32 78,30 L105,29 Q114,29 118,35 L122,42 Z" fill="rgba(180,220,255,0.6)"/>
      <line x1="94" y1="29" x2="94" y2="43" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <!-- Headlights -->
      <rect x="148" y="62" width="10" height="5" rx="2.5" fill="#FFE066" opacity="0.95"/>
      <rect x="148" y="70" width="10" height="3" rx="1.5" fill="#FF6B35" opacity="0.8"/>
      <!-- Tail lights -->
      <rect x="8" y="64" width="8" height="4" rx="2" fill="#FF4444" opacity="0.9"/>
      <!-- Wheels -->
      <circle cx="42" cy="82" r="14" fill="#1a1a1a"/>
      <circle cx="42" cy="82" r="10" fill="#444"/>
      <circle cx="42" cy="82" r="5" fill="#888"/>
      <circle cx="42" cy="82" r="2" fill="#bbb"/>
      <circle cx="128" cy="82" r="14" fill="#1a1a1a"/>
      <circle cx="128" cy="82" r="10" fill="#444"/>
      <circle cx="128" cy="82" r="5" fill="#888"/>
      <circle cx="128" cy="82" r="2" fill="#bbb"/>
      <!-- Reflection -->
      <path d="M30,50 L120,48 L115,55 L35,58 Z" fill="rgba(255,255,255,0.12)"/>
    </g>`;
}

function drawSUV(colors: { primary: string; accent: string }, id: number): string {
  const yOff = (id % 3) * 5;
  return `
    <g transform="translate(15,${45 + yOff})">
      <!-- Shadow -->
      <ellipse cx="82" cy="108" rx="72" ry="6" fill="rgba(0,0,0,0.12)"/>
      <!-- Body -->
      <path d="M8,60 Q8,52 16,48 L148,48 Q156,48 156,55 L156,85 Q156,90 150,90 L14,90 Q8,90 8,85 Z" fill="${colors.primary}"/>
      <!-- Roof -->
      <path d="M30,48 L40,22 Q45,16 55,14 L110,14 Q120,14 125,20 L135,48" fill="${colors.primary}" opacity="0.92"/>
      <!-- Windows -->
      <path d="M42,46 L50,24 Q54,19 62,17 L105,17 Q112,17 116,22 L122,46 Z" fill="rgba(180,220,255,0.55)"/>
      <line x1="82" y1="17" x2="82" y2="46" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
      <!-- Headlights -->
      <rect x="148" y="56" width="10" height="7" rx="3" fill="#FFE066" opacity="0.95"/>
      <rect x="148" y="66" width="10" height="4" rx="2" fill="#FF6B35" opacity="0.8"/>
      <!-- Tail lights -->
      <rect x="5" y="58" width="8" height="6" rx="3" fill="#FF4444" opacity="0.9"/>
      <!-- Wheels -->
      <circle cx="40" cy="90" r="16" fill="#1a1a1a"/>
      <circle cx="40" cy="90" r="11" fill="#444"/>
      <circle cx="40" cy="90" r="6" fill="#888"/>
      <circle cx="40" cy="90" r="2.5" fill="#bbb"/>
      <circle cx="128" cy="90" r="16" fill="#1a1a1a"/>
      <circle cx="128" cy="90" r="11" fill="#444"/>
      <circle cx="128" cy="90" r="6" fill="#888"/>
      <circle cx="128" cy="90" r="2.5" fill="#bbb"/>
      <!-- Roof rack lines -->
      <line x1="50" y1="16" x2="115" y2="16" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="48" y1="20" x2="117" y2="20" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <!-- Reflection -->
      <path d="M25,55 L140,53 L135,60 L30,62 Z" fill="rgba(255,255,255,0.1)"/>
    </g>`;
}

function drawCitadine(colors: { primary: string; accent: string }, id: number): string {
  const yOff = (id % 3) * 5;
  return `
    <g transform="translate(18,${52 + yOff})">
      <!-- Shadow -->
      <ellipse cx="72" cy="100" rx="62" ry="5" fill="rgba(0,0,0,0.12)"/>
      <!-- Body -->
      <path d="M8,62 Q8,56 14,52 L128,52 Q134,52 134,58 L134,78 Q134,82 130,82 L12,82 Q8,82 8,78 Z" fill="${colors.primary}"/>
      <!-- Roof -->
      <path d="M35,52 L42,30 Q46,24 54,22 L95,22 Q102,22 105,28 L112,52" fill="${colors.primary}" opacity="0.92"/>
      <!-- Windows -->
      <path d="M44,50 L50,32 Q54,27 60,25 L92,25 Q98,25 101,30 L106,50 Z" fill="rgba(180,220,255,0.6)"/>
      <line x1="74" y1="25" x2="74" y2="50" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
      <!-- Headlights -->
      <rect x="128" y="58" width="8" height="5" rx="2.5" fill="#FFE066" opacity="0.95"/>
      <rect x="128" y="66" width="8" height="3" rx="1.5" fill="#FF6B35" opacity="0.8"/>
      <!-- Tail lights -->
      <rect x="5" y="60" width="7" height="4" rx="2" fill="#FF4444" opacity="0.9"/>
      <!-- Wheels -->
      <circle cx="34" cy="82" r="12" fill="#1a1a1a"/>
      <circle cx="34" cy="82" r="8" fill="#444"/>
      <circle cx="34" cy="82" r="4" fill="#888"/>
      <circle cx="34" cy="82" r="1.5" fill="#bbb"/>
      <circle cx="110" cy="82" r="12" fill="#1a1a1a"/>
      <circle cx="110" cy="82" r="8" fill="#444"/>
      <circle cx="110" cy="82" r="4" fill="#888"/>
      <circle cx="110" cy="82" r="1.5" fill="#bbb"/>
      <!-- Reflection -->
      <path d="M22,56 L118,54 L114,60 L26,62 Z" fill="rgba(255,255,255,0.12)"/>
    </g>`;
}

function drawPickup(colors: { primary: string; accent: string }, id: number): string {
  const yOff = (id % 3) * 5;
  return `
    <g transform="translate(10,${45 + yOff})">
      <!-- Shadow -->
      <ellipse cx="85" cy="112" rx="75" ry="6" fill="rgba(0,0,0,0.12)"/>
      <!-- Body -->
      <path d="M5,65 Q5,58 13,54 L95,54 L95,40 Q95,32 103,30 L155,30 Q163,30 163,38 L163,80 Q163,85 158,85 L10,85 Q5,85 5,80 Z" fill="${colors.primary}"/>
      <!-- Bed -->
      <rect x="8" y="55" width="85" height="28" rx="4" fill="${colors.primary}" opacity="0.85"/>
      <line x1="12" y1="60" x2="88" y2="60" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="12" y1="75" x2="88" y2="75" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <!-- Cab windows -->
      <path d="M100,42 Q104,34 112,32 L150,32 Q156,32 156,38 L156,52 L100,52 Z" fill="rgba(180,220,255,0.55)"/>
      <line x1="128" y1="32" x2="128" y2="52" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
      <!-- Headlights -->
      <rect x="156" y="55" width="8" height="6" rx="3" fill="#FFE066" opacity="0.95"/>
      <rect x="156" y="64" width="8" height="4" rx="2" fill="#FF6B35" opacity="0.8"/>
      <!-- Tail lights -->
      <rect x="3" y="60" width="7" height="5" rx="2" fill="#FF4444" opacity="0.9"/>
      <!-- Wheels -->
      <circle cx="35" cy="85" r="16" fill="#1a1a1a"/>
      <circle cx="35" cy="85" r="11" fill="#444"/>
      <circle cx="35" cy="85" r="6" fill="#888"/>
      <circle cx="35" cy="85" r="2.5" fill="#bbb"/>
      <circle cx="140" cy="85" r="16" fill="#1a1a1a"/>
      <circle cx="140" cy="85" r="11" fill="#444"/>
      <circle cx="140" cy="85" r="6" fill="#888"/>
      <circle cx="140" cy="85" r="2.5" fill="#bbb"/>
    </g>`;
}

export default function CarIllustration({ make, model, className = "" }: CarIllustrationProps) {
  const colors = getColors(make);
  const id = hashStr(make + model);
  const body = getBodyType(make, model);

  const svgBody =
    body === "suv" ? drawSUV(colors, id) :
    body === "citadine" ? drawCitadine(colors, id) :
    body === "pickup" ? drawPickup(colors, id) :
    drawSedan(colors, id);

  return (
    <svg viewBox="0 0 180 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#f5f0eb" />
        </linearGradient>
        <radialGradient id={`shine-${id}`} cx="30%" cy="25%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="180" height="120" fill={`url(#bg-${id})`} rx="16"/>
      <rect width="180" height="120" fill={`url(#shine-${id})`} rx="16"/>
      {svgBody}
      <text x="90" y="16" textAnchor="middle" fill={colors.primary} fontSize="7" fontFamily="'DM Sans', sans-serif" fontWeight="700" opacity="0.8">
        {make}
      </text>
      <text x="90" y="24" textAnchor="middle" fill={colors.accent} fontSize="6" fontFamily="'DM Sans', sans-serif" fontWeight="500" opacity="0.6">
        {model}
      </text>
    </svg>
  );
}
