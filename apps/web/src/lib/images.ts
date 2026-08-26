import { readFileSync } from "fs";
import { join } from "path";

let cache: Record<string, string> | null = null;

function cachePath(): string {
  return join(process.cwd(), "scripts", "image-cache.json");
}

function loadCache(): Record<string, string> {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(cachePath(), "utf-8")) as Record<string, string>;
  } catch {
    cache = {};
  }
  return cache;
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function imageKey(make: string, model: string): string {
  return `${stripAccents(make).toLowerCase()}_${stripAccents(model).toLowerCase()}`;
}

export function cachedImageFor(make: string, model: string): string {
  return loadCache()[imageKey(make, model)] || "";
}
