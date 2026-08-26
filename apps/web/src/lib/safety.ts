export interface SafetyEntry {
  make: string;
  model: string;
  stars: number;
  ratingYear: number;
  source: "euroncap" | "nhtsa";
}

const SAFETY_DATA: SafetyEntry[] = [
  { make: "Dacia", model: "Sandero", stars: 3, ratingYear: 2021, source: "euroncap" },
  { make: "Dacia", model: "Duster", stars: 3, ratingYear: 2017, source: "euroncap" },
  { make: "Dacia", model: "Spring", stars: 1, ratingYear: 2021, source: "euroncap" },
  { make: "Renault", model: "Clio", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Renault", model: "Captur", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Renault", model: "Megane", stars: 5, ratingYear: 2015, source: "euroncap" },
  { make: "Peugeot", model: "208", stars: 4, ratingYear: 2019, source: "euroncap" },
  { make: "Peugeot", model: "2008", stars: 4, ratingYear: 2019, source: "euroncap" },
  { make: "Peugeot", model: "3008", stars: 5, ratingYear: 2016, source: "euroncap" },
  { make: "Peugeot", model: "308", stars: 5, ratingYear: 2014, source: "euroncap" },
  { make: "Peugeot", model: "508", stars: 5, ratingYear: 2018, source: "euroncap" },
  { make: "Toyota", model: "Yaris", stars: 5, ratingYear: 2020, source: "euroncap" },
  { make: "Toyota", model: "Corolla", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Toyota", model: "C-HR", stars: 5, ratingYear: 2017, source: "euroncap" },
  { make: "Toyota", model: "RAV4", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Hyundai", model: "i20", stars: 4, ratingYear: 2020, source: "euroncap" },
  { make: "Hyundai", model: "Tucson", stars: 5, ratingYear: 2021, source: "euroncap" },
  { make: "Hyundai", model: "Kona", stars: 5, ratingYear: 2017, source: "euroncap" },
  { make: "Kia", model: "Niro", stars: 5, ratingYear: 2022, source: "euroncap" },
  { make: "Kia", model: "Sportage", stars: 5, ratingYear: 2022, source: "euroncap" },
  { make: "Kia", model: "Stonic", stars: 3, ratingYear: 2017, source: "euroncap" },
  { make: "Volkswagen", model: "Golf", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Volkswagen", model: "T-Roc", stars: 5, ratingYear: 2017, source: "euroncap" },
  { make: "Volkswagen", model: "Tiguan", stars: 5, ratingYear: 2016, source: "euroncap" },
  { make: "Ford", model: "Puma", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Ford", model: "Kuga", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Nissan", model: "Qashqai", stars: 5, ratingYear: 2021, source: "euroncap" },
  { make: "Nissan", model: "Juke", stars: 4, ratingYear: 2019, source: "euroncap" },
  { make: "Fiat", model: "500", stars: 3, ratingYear: 2017, source: "euroncap" },
  { make: "Citroën", model: "C3", stars: 3, ratingYear: 2017, source: "euroncap" },
  { make: "Citroën", model: "C5 Aircross", stars: 4, ratingYear: 2018, source: "euroncap" },
  { make: "Opel", model: "Corsa", stars: 4, ratingYear: 2019, source: "euroncap" },
  { make: "Opel", model: "Mokka", stars: 4, ratingYear: 2020, source: "euroncap" },
  { make: "BMW", model: "X1", stars: 5, ratingYear: 2022, source: "euroncap" },
  { make: "BMW", model: "X3", stars: 5, ratingYear: 2017, source: "euroncap" },
  { make: "Mercedes", model: "Classe A", stars: 5, ratingYear: 2018, source: "euroncap" },
  { make: "Mercedes", model: "GLA", stars: 5, ratingYear: 2020, source: "euroncap" },
  { make: "Honda", model: "Jazz", stars: 5, ratingYear: 2023, source: "euroncap" },
  { make: "Honda", model: "Civic", stars: 5, ratingYear: 2022, source: "euroncap" },
  { make: "Mazda", model: "CX-30", stars: 5, ratingYear: 2019, source: "euroncap" },
  { make: "Volvo", model: "XC40", stars: 5, ratingYear: 2018, source: "euroncap" },
  { make: "Suzuki", model: "Vitara", stars: 3, ratingYear: 2015, source: "euroncap" },
];

function modelKey(m: string): string {
  return m.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findMatch(make: string, model: string): SafetyEntry | null {
  const mk = make.toLowerCase();
  const mm = modelKey(model);
  let best: SafetyEntry | null = null;
  for (const entry of SAFETY_DATA) {
    if (entry.make.toLowerCase() !== mk) continue;
    const em = modelKey(entry.model);
    if (em === mm || em.includes(mm) || mm.includes(em)) {
      if (!best || entry.ratingYear > best.ratingYear) best = entry;
    }
  }
  return best;
}

export function safetyRatingFor(make: string, model: string): SafetyEntry | null {
  return findMatch(make, model);
}

export function safetyLabel(safety: SafetyEntry | null): string {
  if (!safety) return "Non évalué";
  const program = safety.source === "nhtsa" ? "NHTSA" : "Euro NCAP";
  return `${safety.stars} étoile${safety.stars > 1 ? "s" : ""} — ${program} ${safety.ratingYear}`;
}
