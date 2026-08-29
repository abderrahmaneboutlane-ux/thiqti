"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import CarIllustration from "./CarIllustration";

interface CarImageProps {
  src: string | undefined;
  sources?: string[];
  alt: string;
  make: string;
  model: string;
  bodyType?: string;
  className?: string;
  priority?: boolean;
}

const BRAND_HD_IMAGES: Record<string, string> = {
  dacia: "https://images.unsplash.com/photo-1611016186333-205f68d3d8ec?w=800&auto=format&fit=crop&q=80",
  renault: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
  peugeot: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  volkswagen: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
  toyota: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
  hyundai: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&auto=format&fit=crop&q=80",
  kia: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  "mercedes-benz": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80",
  mercedes: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80",
  bmw: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80",
  audi: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80",
  byd: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
  mg: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  citroën: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  citroen: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  opel: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
  chery: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  geely: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
  cupra: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
  porsche: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
  ford: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format&fit=crop&q=80",
  nissan: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=80",
  honda: "https://images.unsplash.com/photo-1606611013016-969c19ba27a5?w=800&auto=format&fit=crop&q=80",
  mazda: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80",
  suzuki: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop&q=80",
  fiat: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  skoda: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
  seat: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=80"
};

const BODY_HD_IMAGES: Record<string, string> = {
  suv: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  citadine: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  berline: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
  crossover: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  monospace: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80",
  "pick-up": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop&q=80",
  utilitaire: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop&q=80"
};

export default function CarImage({ src, sources = [], alt, make, model, bodyType, className = "", priority = false }: CarImageProps) {
  const [index, setIndex] = useState(0);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  // For internal lookups (lowercase keys)
  const cleanMake = (make || "").toLowerCase().trim();
  const cleanBody = (bodyType || "").toLowerCase().trim();
  const fallbackHd = BRAND_HD_IMAGES[cleanMake] || BODY_HD_IMAGES[cleanBody] || BRAND_HD_IMAGES.default;

  // For CarIllustration (title-case keys in BRAND_COLORS)
  const illustrationMake = (make || "").trim();

  const all = useMemo(() => {
    const list: string[] = [];
    if (src && (src.startsWith("http") || src.startsWith("/images/"))) {
      list.push(src);
    }
    for (const s of sources) {
      if (s && (s.startsWith("http") || s.startsWith("/images/")) && !list.includes(s)) {
        list.push(s);
      }
    }
    const placeholder = "/images/car-placeholder.svg";
    if (!list.includes(placeholder)) {
      list.push(placeholder);
    }
    if (!list.includes(fallbackHd)) {
      list.push(fallbackHd);
    }
    return list;
  }, [src, sources, fallbackHd]);

  const handleError = useCallback(() => {
    if (index < all.length - 1) {
      setIndex(index + 1);
    } else {
      setFallbackFailed(true);
    }
  }, [index, all]);

  if (!fallbackFailed && all.length > 0 && index < all.length) {
    return (
      <Image
        key={all[index]}
        src={all[index]}
        alt={alt || `${make} ${model}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover ${className}`}
        onError={handleError}
        priority={priority}
      />
    );
  }

  return <CarIllustration make={illustrationMake} model={model} className={className} />;
}
