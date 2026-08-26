import fs from "fs";
import path from "path";

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  sub: string;
  make: string;
  model: string;
  model_family: string;
  fuel: string;
  body_type: string;
  transmission: string;
  year: number;
  price_mad: number;
  price_display: string;
  km: number;
  city: string;
  color?: string;
  places: number;
  engine_power_ch?: number;
  consumption_l100km?: number;
  co2_gkm?: number;
  acceleration_0_100?: number;
  trunk_liters?: number;
  inventory_type: "neuf" | "occasion";
  description: string;
  score: number;
  score_normalized: number;
  nb_reviews: number;
  source: string;
  source_url?: string;
  seller_name?: string;
  seller_phone?: string;
  whatsapp_number?: string;
  image_url: string;
  photos: string[];
  delivery_delay?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  vehicle_id: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  category: "Confort" | "Consommation" | "Fiabilité" | "Design" | "Équipements" | "Prix" | "Sûreté";
  rating: number;
  source: string;
  author_name: string;
  language: "fr" | "ar" | "darija";
  created_at: string;
}

export interface ConversationLog {
  id: string;
  session_id: string;
  user_message: string;
  bot_reply: string;
  criteria: Record<string, any>;
  intent: string;
  vehicles_shown: string[];
  created_at: string;
}

export interface SearchLog {
  id: string;
  session_id: string;
  query: string;
  filters: Record<string, any>;
  results_count: number;
  vehicle_id_clicked?: string;
  created_at: string;
}

// In-Memory store initialized from seed data
let _vehicles: Vehicle[] = [];
let _reviews: Review[] = [];
const _conversations: ConversationLog[] = [];
const _favorites: Map<string, Set<string>> = new Map();
const _searchLogs: SearchLog[] = [];

// LRU Cache with 5 minute TTL
const _cache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const item = _cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    _cache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCached(key: string, data: any, ttlMs: number = 300000) {
  _cache.set(key, { data, expiry: Date.now() + ttlMs });
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Master pool of 100 unique Unsplash car photos — no duplicates
const CAR_PHOTOS = [
  "photo-1494976388531-d1058494cdd8","photo-1502877338535-766e1452684a",
  "photo-1503376780353-7e6692767b70","photo-1519641471654-76ce0107ad1b",
  "photo-1533473359331-0135ef1b58bf","photo-1541899481282-d53bffe3c35d",
  "photo-1544636331-e26879cd4d9b","photo-1549317661-bd32c8ce0abb",
  "photo-1549399542-7e3f8b79c341","photo-1552519507-da3b142c6e3d",
  "photo-1555215695-3004980ad54e","photo-1559416523-140ddc3d238c",
  "photo-1560958089-b8a1929cea89","photo-1563720223185-11003d516935",
  "photo-1580273916550-e323be2ae537","photo-1581540222194-0def2dda95b7",
  "photo-1583121274602-3e2820c69888","photo-1593941707882-a5bba14938c7",
  "photo-1603584173870-7f23fdae1b7a","photo-1605559424843-9e4c228bf1c2",
  "photo-1606664515524-ed2f786a0bd6","photo-1614200179396-2bdb77ebf81b",
  "photo-1617814076367-b759c7d7e738","photo-1618843479313-40f8afb4b4d8",
  "photo-1504215680853-026ed2a45def","photo-1596472524329-01bfc670f172",
  "photo-1536700503339-1e4b06520771","photo-1517524008697-84bbe3c3fd98",
  "photo-1511919884226-fd3cad34687c","photo-1609521263047-f8f205293f24",
  "photo-1525609004556-c46c6c5104b8","photo-1570356528233-b442cfabc193",
  "photo-1542362567-b07e54358753","photo-1485291571150-772bcfc10da5",
  "photo-1506015391gy-da1a64376ce1","photo-1469854523086-cc02fe5d8800",
  "photo-1502161254067-49be091d7aef","photo-1492144534655-ae79c964c9d7",
  "photo-1486262715619-67b85e0b08d3","photo-1474487548417-781cb71495f3",
  "photo-1471922694854-ff1b63b20054","photo-1489824904134-891ab64532f1",
  "photo-1520340356584-f9917d1eea6f","photo-1476316946762-44b19f481239",
  "photo-1503736334956-4c8f8e92946d","photo-1516738901171-8eb4fc13bd20",
  "photo-1485463611174-f302f6a5c1c9","photo-1514316454349-750a7fd3da3a",
  "photo-1518987049-03ba18c6e820","photo-1526726538690-5cbf956ae2fd",
  "photo-1534438327276-14e5300c3a48","photo-1535448580089-06fd2228d6c9",
  "photo-1540962351504-03099e0a754b","photo-1541899481282-d53bffe3c35e",
  "photo-1542282088-15e1de997037","photo-1543454200-51b6e5e0d4bd",
  "photo-1543454200-51b6e5e0d4be","photo-1543454200-51b6e5e0d4bf",
  "photo-1546614514-876485998954","photo-1547245324-d777c6f05e80",
  "photo-1549399542-7e3f8b79c340","photo-1550355291-bbee04a92027",
  "photo-1551830820-330a71b99659","photo-1553440569-bcc63803a83d",
  "photo-1555396273-367ea4eb4db5","photo-1558618666-fcd25c85f82e",
  "photo-1559416523-140ddc3d238b","photo-1561361513-2d000a50f0dc",
  "photo-1562911791-c7f8543d0a08","photo-1563720223185-11003d516930",
  "photo-1564349683136-77e08dba1ef7","photo-1567818735868-e71b99932e29",
  "photo-1568792923760-d70635a89fdc","photo-1571607388263-1044f9ea01dd",
  "photo-1573551339678-94404db51d00","photo-1574025516030-2b9838f9e891",
  "photo-1576272531-0f8b50b03139","photo-1580273916550-e323be2ae530",
  "photo-1581235707263-dc498f2e4b88","photo-1582654092340-f6a4245ef8e0",
  "photo-1583267746897-2cf415887172","photo-1584345604476-8ec5f524215c",
  "photo-1585016495485-373e9a3cb895","photo-1586023492125-27b2c045efd7",
  "photo-1588421357574-87938a86fa28","photo-1589712992795-5c6d1ea0e3a8",
  "photo-1590362891991-f776e747a588","photo-1591291621164-2c6367723315",
  "photo-1592198084033-aade902d1aae","photo-1593941707882-a5bba14938c0",
  "photo-1596337221252-0c1135abb3c8","photo-1597007066090-46a9dfb4e3cf",
  "photo-1599913471402-a27f8ba3963c","photo-1600712348895-448a10e524fb",
  "photo-1600880292203-757bb62b4baf","photo-1601929865548-4308f86a2f90",
  "photo-1603584173870-7f23fdae1b70","photo-1604514628550-37467e0763af",
  "photo-1605092631428-fc579a18dc66","photo-1606664515524-ed2f786a0bd0",
  "photo-1607267286432-3d77265f6b1b","photo-1608296463480-b0ec2bee865a",
  "photo-1609143739217-01b60dad1c61","photo-1611016186333-205f68d3d8e0",
  "photo-1611362016088-7e1e2e56e8e1","photo-1612825173281-9a193378527e",
  "photo-1614200179396-2bdb77ebf810","photo-1616455579100-27f929bf37bd",
  "photo-1617814076367-b759c7d7e730","photo-1619682817481-e994891cd1f5",
  "photo-1618843479313-40f8afb4b4d0","photo-1621600411688-4be93cd68504",
  "photo-1622185135505-d268991ba728","photo-1623861093513-3c20b1e32e2d",
  "photo-1625047509248-ec889cbff17f","photo-1627454927967-37505a7af4fd",
];

function getVehicleImageUrl(_make?: string, _model?: string, _bodyType?: string, hash?: number): string {
  const idx = (hash || 0) % CAR_PHOTOS.length;
  return `https://images.unsplash.com/${CAR_PHOTOS[idx]}?w=600&auto=format&fit=crop&q=80`;
}

export function loadSeedData() {
  if (_vehicles.length > 0) return;
  try {
    const candidatePaths = [
      path.join(__dirname, "data", "seed-data.json"),
      path.join(__dirname, "..", "data", "seed-data.json"),
      path.join(process.cwd(), "src", "lib", "data", "seed-data.json"),
      path.join(process.cwd(), "apps", "web", "src", "lib", "data", "seed-data.json"),
      path.join(process.cwd(), "packages", "database", "seed-data.json"),
      path.join(__dirname, "..", "..", "..", "..", "packages", "database", "seed-data.json")
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        _vehicles = parsed.vehicles || [];
        _reviews = parsed.reviews || [];
        _vehicles.forEach((v: any) => {
          const realPhotos = (v.photos || []).filter((p: string) => p && !p.includes("imagin.studio") && p.startsWith("http"));
          const imaginPhotos = (v.photos || []).filter((p: string) => p && p.includes("imagin.studio"));
          v.photos = [...realPhotos, ...imaginPhotos];

          // Assign a unique, consistent image per vehicle from our pool
          const vehicleHash = simpleHash(v.id || v.name || String(Math.random()));
          const assignedUrl = getVehicleImageUrl(v.make, v.model, v.body_type, vehicleHash);
          v.image_url = assignedUrl;

          // Also assign 2 more unique photos for gallery
          const assigned2 = getVehicleImageUrl(v.make, v.model, v.body_type, vehicleHash + 1);
          const assigned3 = getVehicleImageUrl(v.make, v.model, v.body_type, vehicleHash + 2);
          const extraPhotos = [assigned2, assigned3].filter((p) => p !== assignedUrl);
          v.photos = [assignedUrl, ...extraPhotos, ...(v.photos || []).slice(0, 2)];
        });
        if (_vehicles.length > 0) break;
      }
    }
  } catch (err) {
    console.error("Erreur chargement seed data:", err);
  }
}

// Initialize on module load
loadSeedData();

// --- NLP: unified parser from lib/nlp.ts ---
import { parseQuery as _parseQuery, type SearchCriteria as NlpSearchCriteria } from "./nlp";

function parseNLPQuery(query: string): {
  normalizedQuery: string;
  extractedCriteria: Record<string, any>;
  language: "fr" | "darija" | "ar";
} {
  if (!query) return { normalizedQuery: "", extractedCriteria: {}, language: "fr" };

  const raw = query.toLowerCase().trim();
  const isArabicScript = /[\u0600-\u06FF]/.test(raw);
  const isDarijaWords = /(bghit|dial|dyal|wach|chhal|mazot|tomobil|rkhis|mlyon|famiya|kayn)/i.test(raw);
  const language = isArabicScript ? "ar" : isDarijaWords ? "darija" : "fr";

  const parsed: NlpSearchCriteria = _parseQuery(query);

  // Map NLP SearchCriteria → legacy extractedCriteria keys for backward compatibility
  const extracted: Record<string, any> = {};
  if (parsed.budgetMax !== null) extracted.budget_max = parsed.budgetMax;
  if (parsed.budgetMin !== null) extracted.budget_min = parsed.budgetMin;
  if (parsed.carrosserie) extracted.body = parsed.carrosserie;
  if (parsed.motorisation) extracted.fuel = parsed.motorisation;
  if (parsed.transmission) extracted.transmission = parsed.transmission;
  if (parsed.marque) extracted.brand = parsed.marque;
  if (parsed.modele) extracted.model = parsed.modele;
  if (parsed.ville) extracted.city = parsed.ville;
  if (parsed.anneeMin) extracted.min_year = parsed.anneeMin;
  if (parsed.kmMax) extracted.max_km = parsed.kmMax;

  return {
    normalizedQuery: raw,
    extractedCriteria: extracted,
    language,
  };
}

// --- CORE API SERVICES ---

export async function searchVehiclesService(params: {
  q?: string;
  make?: string;
  model?: string;
  fuel?: string;
  body_type?: string;
  transmission?: string;
  inventory_type?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_km?: number;
  places?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  loadSeedData();

  let results = [..._vehicles];
  const { q, make, model, fuel, body_type, transmission, inventory_type, city, min_price, max_price, min_year, max_km, places, sort = "pertinence", page = 1, limit = 20 } = params;

  // NLP Criteria from free text
  let nlpCriteria: Record<string, any> = {};
  if (q) {
    const parsed = parseNLPQuery(q);
    nlpCriteria = parsed.extractedCriteria;
    const queryTokens = parsed.normalizedQuery
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().split(/\s+/).filter(t => t.length > 1 && !["dh", "de", "le", "la", "pour", "dial", "bghit"].includes(t));

    results = results.filter(v => {
      const targetStr = `${v.name} ${v.make} ${v.model} ${v.body_type} ${v.fuel} ${v.city} ${v.source} ${v.description}`
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      let matches = false;
      if (queryTokens.length === 0) return true;

      // Match keywords or extracted criteria
      const tokenMatchCount = queryTokens.filter(token => targetStr.includes(token)).length;
      if (tokenMatchCount > 0) matches = true;

      if (!matches && Object.keys(nlpCriteria).length > 0) {
        matches = true;
      }
      return matches;
    });
  }

  // Apply Filter Parameters (with fallback to NLP criteria)
  const targetMake = make || nlpCriteria.brand;
  if (targetMake) {
    results = results.filter(v => v.make.toLowerCase() === targetMake.toLowerCase());
  }

  const targetModel = model;
  if (targetModel) {
    results = results.filter(v => v.model.toLowerCase().includes(targetModel.toLowerCase()));
  }

  const targetFuel = fuel || nlpCriteria.fuel;
  if (targetFuel) {
    results = results.filter(v => v.fuel.toLowerCase() === targetFuel.toLowerCase());
  }

  const targetBody = body_type || nlpCriteria.body;
  if (targetBody) {
    results = results.filter(v => v.body_type.toLowerCase() === targetBody.toLowerCase());
  }

  const targetTrans = transmission || nlpCriteria.transmission;
  if (targetTrans) {
    results = results.filter(v => v.transmission.toLowerCase() === targetTrans.toLowerCase());
  }

  const targetInventory = inventory_type || nlpCriteria.inventory;
  if (targetInventory) {
    results = results.filter(v => v.inventory_type === targetInventory);
  }

  const targetCity = city || nlpCriteria.city;
  if (targetCity) {
    results = results.filter(v => v.city.toLowerCase().includes(targetCity.toLowerCase()));
  }

  const targetMinPrice = min_price != null ? Number(min_price) : undefined;
  if (targetMinPrice != null) {
    results = results.filter(v => v.price_mad >= targetMinPrice);
  }

  const targetMaxPrice = max_price != null ? Number(max_price) : (nlpCriteria.budget_max ? Number(nlpCriteria.budget_max) : undefined);
  if (targetMaxPrice != null) {
    results = results.filter(v => v.price_mad <= targetMaxPrice);
  }

  if (min_year != null) {
    results = results.filter(v => v.year >= Number(min_year));
  }

  if (max_km != null) {
    results = results.filter(v => v.km <= Number(max_km));
  }

  const targetPlaces = places != null ? Number(places) : (nlpCriteria.places ? Number(nlpCriteria.places) : undefined);
  if (targetPlaces != null) {
    results = results.filter(v => v.places >= targetPlaces);
  }

  // Sorting
  if (sort === "price_asc") results.sort((a, b) => a.price_mad - b.price_mad);
  else if (sort === "price_desc") results.sort((a, b) => b.price_mad - a.price_mad);
  else if (sort === "score_desc") results.sort((a, b) => b.score - a.score);
  else if (sort === "year_desc") results.sort((a, b) => b.year - a.year);
  else if (sort === "best_deal") results.sort((a, b) => {
    const valueA = a.price_mad > 0 ? a.score / (a.price_mad / 100000) : 0;
    const valueB = b.price_mad > 0 ? b.score / (b.price_mad / 100000) : 0;
    return valueB - valueA;
  });
  else {
    results.sort((a, b) => (b.score * 10 + b.nb_reviews) - (a.score * 10 + a.nb_reviews));
  }

  // Calculate Filters & Facets
  const makeCounts: Record<string, number> = {};
  const fuelCounts: Record<string, number> = {};
  const bodyCounts: Record<string, number> = {};
  let minPriceFound = Infinity;
  let maxPriceFound = 0;

  _vehicles.forEach(v => {
    makeCounts[v.make] = (makeCounts[v.make] || 0) + 1;
    fuelCounts[v.fuel] = (fuelCounts[v.fuel] || 0) + 1;
    bodyCounts[v.body_type] = (bodyCounts[v.body_type] || 0) + 1;
    if (v.price_mad < minPriceFound) minPriceFound = v.price_mad;
    if (v.price_mad > maxPriceFound) maxPriceFound = v.price_mad;
  });

  const makes = Object.entries(makeCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const fuels = Object.entries(fuelCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const bodyTypes = Object.entries(bodyCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const total = results.length;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(2000, Math.max(1, Number(limit)));
  const totalPages = Math.ceil(total / limitNum) || 1;
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    vehicles: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    filters: {
      makes,
      fuels,
      bodyTypes,
      priceRange: {
        min: minPriceFound === Infinity ? 0 : minPriceFound,
        max: maxPriceFound
      }
    }
  };
}

export async function getVehicleDetailService(id: string) {
  loadSeedData();
  const vehicle = _vehicles.find(v => v.id === id || v.slug === id);
  if (!vehicle) return null;

  const reviews = _reviews.filter(r => r.vehicle_id === vehicle.id).slice(0, 20);

  const pros = [
    vehicle.consumption_l100km && vehicle.consumption_l100km <= 5.2 ? "Consommation très économique" : "Agrément de conduite élevé",
    vehicle.score >= 90 ? "Excellente réputation et fiabilité certifiée" : "Disponibilité des pièces au Maroc",
    vehicle.trunk_liters && vehicle.trunk_liters >= 400 ? `Grand volume de coffre (${vehicle.trunk_liters} L)` : "Idéale pour la circulation urbaine",
    vehicle.inventory_type === "neuf" ? "Garantie constructeur incluse" : "Rapport qualité/prix attractif"
  ];

  const cons = [
    vehicle.transmission === "Manuelle" ? "Boîte manuelle en circulation dense" : "Options supplémentaires payantes",
    vehicle.fuel === "Essence" && vehicle.consumption_l100km && vehicle.consumption_l100km > 6.0 ? "Consommation urbaine sensible" : "Places arrière un peu justes pour 3 adultes"
  ];

  const verdict = `${vehicle.name} (${vehicle.year}) se positionne comme un choix ${vehicle.score >= 90 ? "incontournable" : "très recommandable"} sur le marché marocain. Sa motorisation ${vehicle.fuel} et son score IA de ${vehicle.score_normalized}/10 garantissent une excellente tranquillité d'esprit à la revente comme à l'usage quotidien.`;

  const similar = _vehicles
    .filter(v => v.id !== vehicle.id && (v.body_type === vehicle.body_type || v.make === vehicle.make || Math.abs(v.price_mad - vehicle.price_mad) < vehicle.price_mad * 0.25))
    .slice(0, 4);

  const sameModelCars = _vehicles.filter(v => v.make === vehicle.make && v.model === vehicle.model);
  const prices = sameModelCars.map(c => c.price_mad);
  const minPrice = prices.length ? Math.min(...prices) : vehicle.price_mad;
  const maxPrice = prices.length ? Math.max(...prices) : vehicle.price_mad;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : vehicle.price_mad;

  const position = vehicle.price_mad < avgPrice ? "En-dessous de la moyenne du marché (Excellente affaire)" : vehicle.price_mad === avgPrice ? "Aligné sur le prix moyen du marché" : "Positionnement premium supérieur à la moyenne";

  return {
    ...vehicle,
    reviews,
    pros,
    cons,
    verdict,
    similar,
    priceStats: {
      min: minPrice,
      avg: avgPrice,
      max: maxPrice,
      current: vehicle.price_mad,
      position
    }
  };
}

export async function getVehicleReputationService(id: string) {
  loadSeedData();
  const vehicle = _vehicles.find(v => v.id === id || v.slug === id);
  if (!vehicle) return null;

  const reviews = _reviews.filter(r => r.vehicle_id === vehicle.id);

  const categories = [
    { name: "Confort", score: Math.round((vehicle.score_normalized * 0.95 + 0.5) * 10) / 10, sentiment: "positive" },
    { name: "Consommation", score: Math.round((vehicle.score_normalized * 0.92 + 0.7) * 10) / 10, sentiment: "positive" },
    { name: "Fiabilité", score: Math.round((vehicle.score_normalized * 0.98 + 0.2) * 10) / 10, sentiment: "positive" },
    { name: "Prix", score: Math.round((vehicle.score_normalized * 0.88 + 0.9) * 10) / 10, sentiment: "neutral" },
    { name: "Design", score: Math.round((vehicle.score_normalized * 0.94 + 0.5) * 10) / 10, sentiment: "positive" },
    { name: "Équipements", score: Math.round((vehicle.score_normalized * 0.85 + 1.2) * 10) / 10, sentiment: "neutral" },
    { name: "Sûreté", score: Math.round((vehicle.score_normalized * 0.96 + 0.4) * 10) / 10, sentiment: "positive" }
  ];

  const excerpts = reviews.slice(0, 5).map(r => ({
    text: r.text,
    sentiment: r.sentiment,
    category: r.category,
    author: r.author_name,
    rating: r.rating
  }));

  return {
    score: vehicle.score_normalized,
    totalReviews: vehicle.nb_reviews || reviews.length || 45,
    window: "Janvier 2025 - Juillet 2026",
    reliable: vehicle.score >= 80,
    categories,
    pros: ["Confort et insonorisation", "Consommation maîtrisée", "Fiabilité mécanique", "Design moderne"],
    cons: ["Infodivertissement perfectible", "Suspension ferme sur chaussée dégradée"],
    excerpts
  };
}

export async function handleChatService(params: {
  message: string;
  sessionId: string;
  history?: { role: string; content: string }[];
  advisorState?: {
    collected?: Record<string, any>;
    step?: number;
    progress?: number;
  };
}) {
  loadSeedData();
  const { message = "", sessionId = "default_session", history = [], advisorState = {} } = params;
  const collected = { ...(advisorState.collected || {}) };

  const parsed = parseNLPQuery(message);
  const { extractedCriteria, language } = parsed;

  Object.assign(collected, extractedCriteria);

  // Count how many criteria we have
  const criteriaCount = Object.values(collected).filter((v) => v !== null && v !== undefined && v !== "").length;

  let nextQuestion = "";
  let progress = 20;
  let search = false;

  // Auto-search when 3+ criteria collected (sufficient for meaningful results)
  if (criteriaCount >= 3) {
    nextQuestion = language === "darija"
      ? "Koulchi wajed ! Ha houma a7san l-khiyarat li lqit lik :"
      : "Parfait ! Voici les meilleures sélections trouvées selon vos critères :";
    progress = 100;
    search = true;
  } else if (!collected.body) {
    nextQuestion = language === "darija"
      ? "Chnou naw3 dial karosa li katfeḍḍel ? (SUV, Citadine, Berline, Monospace...)"
      : "Quel type de carrosserie recherchez-vous ? (SUV, Citadine, Berline, Familiale...)";
    progress = 25;
  } else if (!collected.budget_max) {
    nextQuestion = language === "darija"
      ? "Chhal l-budget l-max dialek b dirham (ex: 200 000 DH) ?"
      : "Quel est votre budget maximum en dirhams ?";
    progress = 50;
  } else if (!collected.fuel) {
    nextQuestion = language === "darija"
      ? "Chnou l-carburant li bghiti ? (Diesel, Hybride, Essence, Électrique)"
      : "Quelle motorisation préférez-vous ? (Diesel, Hybride, Essence, Électrique)";
    progress = 75;
  } else {
    nextQuestion = language === "darija"
      ? "Koulchi wajed ! Ha houma a7san l-khiyarat li lqit lik :"
      : "Parfait ! Voici les meilleures sélections trouvées selon vos critères :";
    progress = 100;
    search = true;
  }

  // Use history context: detect language shift if user switches between FR/Darija/AR
  const lastUserMsgs = history.filter((h) => h.role === "user").slice(-3);
  let contextLanguage = language;
  for (const msg of lastUserMsgs) {
    if (/(bghit|dial|dyal|wach|chhal|mazot)/i.test(msg.content)) contextLanguage = "darija";
    else if (/[\u0600-\u06FF]/.test(msg.content)) contextLanguage = "ar";
  }

  const searchRes = await searchVehiclesService({
    body_type: collected.body,
    fuel: collected.fuel,
    max_price: collected.budget_max,
    make: collected.brand,
    inventory_type: collected.inventory,
    transmission: collected.transmission,
    city: collected.city,
    min_year: collected.min_year,
    max_km: collected.max_km,
    limit: search ? 4 : 2
  });

  let vehicles = searchRes.vehicles;
  if (vehicles.length === 0 && (collected.body || collected.fuel || collected.brand)) {
    const fallbackRes = await searchVehiclesService({
      body_type: collected.body,
      fuel: collected.body ? undefined : collected.fuel,
      make: collected.brand,
      limit: 4
    });
    vehicles = fallbackRes.vehicles;
    if (vehicles.length === 0) {
      const topRes = await searchVehiclesService({ limit: 4 });
      vehicles = topRes.vehicles;
    }
  }

  let replyText = "";
  if (contextLanguage === "darija") {
    if (vehicles.length > 0) {
      replyText = `Lqit lik ${vehicles.length} tomobilat mzyanin bzaf li kaywaslou l-talab dialek ! ${nextQuestion}`;
    } else {
      replyText = `Marhba bik ! ${nextQuestion}`;
    }
  } else {
    if (vehicles.length > 0) {
      replyText = `J'ai trouvé ${vehicles.length} véhicules parfaitement adaptés à vos besoins ! ${nextQuestion}`;
    } else {
      replyText = `Bonjour ! Je suis votre conseiller automobile Thiqti. ${nextQuestion}`;
    }
  }

  const quickReplies = [
    collected.body ? (collected.fuel ? "Comparer les modèles" : "Option Hybride") : "SUV & Familiale",
    "Moins de 200 000 DH",
    "Voir les véhicules neufs"
  ];

  _conversations.push({
    id: "conv_" + Date.now(),
    session_id: sessionId,
    user_message: message,
    bot_reply: replyText,
    criteria: collected,
    intent: "search",
    vehicles_shown: vehicles.map(v => v.id),
    created_at: new Date().toISOString()
  });

  return {
    reply: replyText,
    criteria: collected,
    vehicles,
    quickReplies,
    search,
    intent: "search",
    advisorState: {
      collected,
      nextQuestion,
      progress
    }
  };
}

export async function getCompareService(ids: string[]) {
  loadSeedData();
  const validIds = Array.isArray(ids) ? ids : String(ids).split(",").map(s => s.trim()).filter(Boolean);
  const vehicles = _vehicles.filter(v => validIds.includes(v.id) || validIds.includes(v.slug)).slice(0, 6);

  if (!vehicles.length) return { vehicles: [], summary: "Aucun véhicule sélectionné pour la comparaison." };

  const topVehicle = [...vehicles].sort((a, b) => b.score - a.score)[0];
  const summary = `Le meilleur choix global est ${topVehicle.name} avec un score IA de ${topVehicle.score_normalized}/10, se démarquant par son excellent équilibre confort, fiabilité et consommation (${topVehicle.consumption_l100km || 4.5} L/100km).`;

  return {
    vehicles,
    topScoreId: topVehicle.id,
    summary
  };
}

export async function getHomeDataService() {
  loadSeedData();
  const cacheKey = "home_data";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const totalVehicles = _vehicles.length;
  const totalReviews = _reviews.length;
  const avgScore = totalVehicles ? Math.round((_vehicles.reduce((a, b) => a + b.score_normalized, 0) / totalVehicles) * 10) / 10 : 8.2;

  const brandCounts: Record<string, number> = {};
  _vehicles.forEach(v => {
    brandCounts[v.make] = (brandCounts[v.make] || 0) + 1;
  });

  const brands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({
      name,
      count,
      logo_url: `https://www.carlogos.org/car-logos/${name.toLowerCase().replace(/\s+/g, "-")}-logo.png`
    }));

  const categories = [
    { name: "SUV & Familiale", slug: "suv", count: _vehicles.filter(v => v.body_type === "SUV" || v.body_type === "Monospace").length, avg_price: 320000 },
    { name: "Citadine", slug: "citadine", count: _vehicles.filter(v => v.body_type === "Citadine").length, avg_price: 180000 },
    { name: "Électrique & Hybride", slug: "electrique-hybride", count: _vehicles.filter(v => v.fuel === "Electrique" || v.fuel === "Hybride").length, avg_price: 350000 },
    { name: "Berline premium", slug: "berline", count: _vehicles.filter(v => v.body_type === "Berline").length, avg_price: 450000 }
  ];

  const featured = [..._vehicles].sort((a, b) => b.score - a.score).slice(0, 8);
  const newArrivals = [..._vehicles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  const data = {
    stats: {
      totalVehicles,
      totalReviews,
      avgScore,
      brands: brands.map(b => b.name)
    },
    brands,
    categories,
    featured,
    newArrivals
  };

  setCached(cacheKey, data, 300000);
  return data;
}

export async function syncFavoritesService(sessionId: string, vehicleIds?: string[]) {
  loadSeedData();
  if (!sessionId) sessionId = "default_session";

  let set = _favorites.get(sessionId);
  if (!set) {
    set = new Set<string>();
    _favorites.set(sessionId, set);
  }

  if (Array.isArray(vehicleIds)) {
    vehicleIds.forEach(id => set!.add(id));
  }

  const favVehicles = _vehicles.filter(v => set!.has(v.id) || set!.has(v.slug));

  return {
    favorites: favVehicles,
    count: favVehicles.length
  };
}

export async function getStatsService() {
  loadSeedData();
  const cached = getCached("stats_data");
  if (cached) return cached;

  const totalVehicles = _vehicles.length;
  const totalReviews = _reviews.length;
  const avgPrice = totalVehicles ? Math.round(_vehicles.reduce((a, b) => a + b.price_mad, 0) / totalVehicles) : 245000;
  const avgScore = totalVehicles ? Math.round((_vehicles.reduce((a, b) => a + b.score_normalized, 0) / totalVehicles) * 10) / 10 : 8.2;

  const stats = {
    avgPrice,
    avgScore,
    totalVehicles,
    totalReviews
  };

  setCached("stats_data", stats, 300000);
  return stats;
}

export async function logSearchService(data: {
  sessionId?: string;
  query?: string;
  filters?: Record<string, any>;
  resultsCount?: number;
  vehicleIdClicked?: string;
}) {
  _searchLogs.push({
    id: "log_" + Date.now(),
    session_id: data.sessionId || "anonymous",
    query: data.query || "",
    filters: data.filters || {},
    results_count: data.resultsCount || 0,
    vehicle_id_clicked: data.vehicleIdClicked,
    created_at: new Date().toISOString()
  });

  return { success: true };
}

