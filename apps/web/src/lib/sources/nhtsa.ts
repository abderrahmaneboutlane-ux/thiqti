const API_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 6000;

export interface NHTSAMake {
  id: number;
  name: string;
}

let makesCache: { data: NHTSAMake[]; fetchedAt: number } | null = null;

async function getJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface MakesResponse {
  Results?: { MakeId: number; MakeName: string }[];
}

interface ModelsResponse {
  Results?: { Model_Name: string }[];
}

export async function getNHTSAMakes(): Promise<NHTSAMake[]> {
  const now = Date.now();
  if (makesCache && now - makesCache.fetchedAt < CACHE_TTL) return makesCache.data;
  const data = await getJson<MakesResponse>("/GetMakesForVehicleType/car?format=json");
  const makes = (data?.Results || [])
    .map((m) => ({ id: m.MakeId, name: m.MakeName }))
    .filter((m) => m.name && m.name.length > 1)
    .sort((a, b) => a.name.localeCompare(b.name));
  makesCache = { data: makes, fetchedAt: now };
  return makes;
}

export async function getNHTSAModels(make: string): Promise<string[]> {
  const data = await getJson<ModelsResponse>(`/GetModelsForMake/${encodeURIComponent(make)}?format=json`);
  return (data?.Results || [])
    .map((m) => m.Model_Name)
    .filter((m) => m && m.length > 0)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();
}
