export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxKm?: number;
  bodyType?: string;
  fuel?: string;
  brand?: string;
  city?: string;
  minSafety?: number;
}

export interface SearchFacets {
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
  brands: string[];
  bodyTypes: string[];
  fuels: string[];
  cities: string[];
  safety: { evaluated: number; fiveStars: number };
}

export const EMPTY_FILTERS: SearchFilters = {};

export function countActiveFilters(filters: SearchFilters): number {
  return Object.values(filters).filter((v) => v !== undefined && v !== "").length;
}

function toNum(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFilters(params: URLSearchParams): SearchFilters {
  return {
    minPrice: toNum(params.get("minPrice")),
    maxPrice: toNum(params.get("maxPrice")),
    minYear: toNum(params.get("minYear")),
    maxKm: toNum(params.get("maxKm")),
    bodyType: params.get("bodyType") || undefined,
    fuel: params.get("fuel") || undefined,
    brand: params.get("brand") || undefined,
    city: params.get("city") || undefined,
    minSafety: toNum(params.get("minSafety")),
  };
}

export function applyFilters(cars: { price: number; year: number; km: number; bodyType?: string; fuel: string; make: string; city: string; safety?: { stars: number } | null }[], f: SearchFilters): typeof cars {
  const hasAny = Object.values(f).some((v) => v !== undefined);
  if (!hasAny) return cars;
  return cars.filter((c) => {
    if (f.minPrice != null && c.price < f.minPrice) return false;
    if (f.maxPrice != null && c.price > f.maxPrice) return false;
    if (f.minYear != null && c.year < f.minYear) return false;
    if (f.maxKm != null && c.km > f.maxKm) return false;
    if (f.bodyType && c.bodyType !== f.bodyType) return false;
    if (f.fuel && c.fuel !== f.fuel) return false;
    if (f.brand && c.make !== f.brand) return false;
    if (f.city && c.city !== f.city) return false;
    if (f.minSafety != null && !(c.safety && c.safety.stars >= f.minSafety)) return false;
    return true;
  });
}
