import { UnifiedCar, generateId, computeScore } from "./types";

// Autoevolution CDN is broken (hotlink protection returns empty body)
// All fallback cars use CarIllustration SVG instead

type FallbackCar = Omit<UnifiedCar, "id" | "scrapedAt" | "score" | "inventoryType" | "safety">;

const MOROCCAN_CARS: FallbackCar[] = [
  // Dacia - Le leader marocain
  { title: "Dacia Sandero Access 2024", make: "Dacia", model: "Sandero", year: 2024, price: 149000, priceFormatted: "149 000 DH", km: 5000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Sandero Stepway 2023", make: "Dacia", model: "Sandero", year: 2023, price: 165000, priceFormatted: "165 000 DH", km: 15000, fuel: "Essence", transmission: "Manuelle", bodyType: "Crossover", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Sandero Stepway 2022", make: "Dacia", model: "Sandero", year: 2022, price: 144000, priceFormatted: "144 000 DH", km: 42000, fuel: "Essence", transmission: "Manuelle", bodyType: "Crossover", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Logan Essential 2024", make: "Dacia", model: "Logan", year: 2024, price: 169000, priceFormatted: "169 000 DH", km: 8000, fuel: "Essence", transmission: "Manuelle", bodyType: "Berline", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Logan Journey 2023", make: "Dacia", model: "Logan", year: 2023, price: 175000, priceFormatted: "175 000 DH", km: 20000, fuel: "Essence", transmission: "Automatique", bodyType: "Berline", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Duster Essential 2024", make: "Dacia", model: "Duster", year: 2024, price: 219000, priceFormatted: "219 000 DH", km: 3000, fuel: "Essence", transmission: "Manuelle", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Duster TCe 130 2023", make: "Dacia", model: "Duster", year: 2023, price: 235000, priceFormatted: "235 000 DH", km: 18000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Jogger Essential 2024", make: "Dacia", model: "Jogger", year: 2024, price: 195000, priceFormatted: "195 000 DH", km: 12000, fuel: "Essence", transmission: "Manuelle", bodyType: "Monospace", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Sandero Stepway 2021", make: "Dacia", model: "Sandero", year: 2021, price: 128000, priceFormatted: "128 000 DH", km: 55000, fuel: "Essence", transmission: "Manuelle", bodyType: "Crossover", city: "Fès", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Renault - Partenaire Dacia
  { title: "Renault Clio V Intens 2024", make: "Renault", model: "Clio", year: 2024, price: 215000, priceFormatted: "215 000 DH", km: 5000, fuel: "Essence", transmission: "Automatique", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Renault Clio E-Tech 2024", make: "Renault", model: "Clio", year: 2024, price: 245000, priceFormatted: "245 000 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Renault Megane E-TECH 2024", make: "Renault", model: "Megane", year: 2024, price: 310000, priceFormatted: "310 000 DH", km: 2000, fuel: "Électrique", transmission: "Automatique", bodyType: "Berline", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Renault Austral 2024", make: "Renault", model: "Austral", year: 2024, price: 340000, priceFormatted: "340 000 DH", km: 4000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Renault Kardian 2024", make: "Renault", model: "Kardian", year: 2024, price: 239000, priceFormatted: "239 000 DH", km: 6000, fuel: "Diesel", transmission: "Automatique", bodyType: "Crossover", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Renault Duster 2023", make: "Renault", model: "Duster", year: 2023, price: 195000, priceFormatted: "195 000 DH", km: 25000, fuel: "Diesel", transmission: "Manuelle", bodyType: "SUV", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Renault Symbol Authentique 2022", make: "Renault", model: "Symbol", year: 2022, price: 125000, priceFormatted: "125 000 DH", km: 38000, fuel: "Essence", transmission: "Manuelle", bodyType: "Berline", city: "Agadir", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Peugeot
  { title: "Peugeot 208 Active Pack 2024", make: "Peugeot", model: "208", year: 2024, price: 205000, priceFormatted: "205 000 DH", km: 4000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Peugeot 2008 Allure 2024", make: "Peugeot", model: "2008", year: 2024, price: 265000, priceFormatted: "265 000 DH", km: 6000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Peugeot 3008 Allure 2024", make: "Peugeot", model: "3008", year: 2024, price: 375000, priceFormatted: "375 000 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Peugeot 308 GT 2023", make: "Peugeot", model: "308", year: 2023, price: 295000, priceFormatted: "295 000 DH", km: 15000, fuel: "Diesel", transmission: "Automatique", bodyType: "Compacte", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Peugeot 2008 Hybrid 2024", make: "Peugeot", model: "2008", year: 2024, price: 299000, priceFormatted: "299 000 DH", km: 2000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Toyota - Le roi de l'hybride
  { title: "Toyota Yaris Hybrid 2024", make: "Toyota", model: "Yaris", year: 2024, price: 215000, priceFormatted: "215 000 DH", km: 5000, fuel: "Hybride", transmission: "Automatique", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Toyota Yaris Cross Hybrid 2024", make: "Toyota", model: "Yaris Cross", year: 2024, price: 285000, priceFormatted: "285 000 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Toyota Corolla Hybrid 2024", make: "Toyota", model: "Corolla", year: 2024, price: 289000, priceFormatted: "289 000 DH", km: 4000, fuel: "Hybride", transmission: "Automatique", bodyType: "Berline", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Toyota RAV4 Hybrid 2024", make: "Toyota", model: "RAV4", year: 2024, price: 389000, priceFormatted: "389 000 DH", km: 2000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Toyota C-HR Hybrid 2023", make: "Toyota", model: "C-HR", year: 2023, price: 295000, priceFormatted: "295 000 DH", km: 18000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Toyota Yaris Hybrid 2022", make: "Toyota", model: "Yaris", year: 2022, price: 180000, priceFormatted: "180 000 DH", km: 25000, fuel: "Hybride", transmission: "Automatique", bodyType: "Citadine", city: "Fès", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Hyundai
  { title: "Hyundai Tucson 1.6 T-GDi 2024", make: "Hyundai", model: "Tucson", year: 2024, price: 359900, priceFormatted: "359 900 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Hyundai i20 Active 2024", make: "Hyundai", model: "i20", year: 2024, price: 189000, priceFormatted: "189 000 DH", km: 5000, fuel: "Essence", transmission: "Manuelle", bodyType: "Compacte", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Hyundai Kona Hybrid 2024", make: "Hyundai", model: "Kona", year: 2024, price: 275000, priceFormatted: "275 000 DH", km: 4000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Hyundai Bayon 2023", make: "Hyundai", model: "Bayon", year: 2023, price: 195000, priceFormatted: "195 000 DH", km: 15000, fuel: "Essence", transmission: "Manuelle", bodyType: "Crossover", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Hyundai Tucson 1.6 CRDi 2022", make: "Hyundai", model: "Tucson", year: 2022, price: 285000, priceFormatted: "285 000 DH", km: 32000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Kia
  { title: "Kia Sportage 1.6 CRDi 2024", make: "Kia", model: "Sportage", year: 2024, price: 345000, priceFormatted: "345 000 DH", km: 5000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Kia Niro Hybrid 2024", make: "Kia", model: "Niro", year: 2024, price: 309000, priceFormatted: "309 000 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Kia Picanto 2024", make: "Kia", model: "Picanto", year: 2024, price: 138000, priceFormatted: "138 000 DH", km: 2000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Kia Stonic 2023", make: "Kia", model: "Stonic", year: 2023, price: 215000, priceFormatted: "215 000 DH", km: 12000, fuel: "Essence", transmission: "Automatique", bodyType: "Crossover", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Kia Sportage 1.6 CRDi 2022", make: "Kia", model: "Sportage", year: 2022, price: 265000, priceFormatted: "265 000 DH", km: 35000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Fès", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Volkswagen
  { title: "Volkswagen Golf 8 1.5 TSI 2024", make: "Volkswagen", model: "Golf", year: 2024, price: 340000, priceFormatted: "340 000 DH", km: 4000, fuel: "Essence", transmission: "Automatique", bodyType: "Compacte", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Volkswagen T-Roc 2024", make: "Volkswagen", model: "T-Roc", year: 2024, price: 315000, priceFormatted: "315 000 DH", km: 5000, fuel: "Essence", transmission: "Automatique", bodyType: "Crossover", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Volkswagen Tiguan 2024", make: "Volkswagen", model: "Tiguan", year: 2024, price: 395000, priceFormatted: "395 000 DH", km: 2000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Volkswagen Polo 2023", make: "Volkswagen", model: "Polo", year: 2023, price: 205000, priceFormatted: "205 000 DH", km: 18000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // BMW
  { title: "BMW Série 1 118i 2024", make: "BMW", model: "Série 1", year: 2024, price: 395000, priceFormatted: "395 000 DH", km: 3000, fuel: "Essence", transmission: "Automatique", bodyType: "Compacte", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "BMW X1 sDrive 18d 2024", make: "BMW", model: "X1", year: 2024, price: 495000, priceFormatted: "495 000 DH", km: 2000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "BMW X3 xDrive 20d 2023", make: "BMW", model: "X3", year: 2023, price: 580000, priceFormatted: "580 000 DH", km: 15000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Mercedes
  { title: "Mercedes Classe A 180 2024", make: "Mercedes", model: "Classe A", year: 2024, price: 420000, priceFormatted: "420 000 DH", km: 4000, fuel: "Essence", transmission: "Automatique", bodyType: "Compacte", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Mercedes GLA 200 2024", make: "Mercedes", model: "GLA", year: 2024, price: 475000, priceFormatted: "475 000 DH", km: 3000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // BYD - Le chinois émergent
  { title: "BYD Seal U PHEV 2024", make: "BYD", model: "Seal U", year: 2024, price: 359900, priceFormatted: "359 900 DH", km: 1000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "BYD ATTO 3 EVO 2024", make: "BYD", model: "ATTO 3", year: 2024, price: 355900, priceFormatted: "355 900 DH", km: 500, fuel: "Électrique", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // MG - excellent rapport qualité/prix
  { title: "MG HS Hybrid+ 2024", make: "MG", model: "HS", year: 2024, price: 269000, priceFormatted: "269 000 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "MG ZS EV 2024", make: "MG", model: "ZS EV", year: 2024, price: 299000, priceFormatted: "299 000 DH", km: 1000, fuel: "Électrique", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Ford
  { title: "Ford Kuga 2.0 TDCi 2023", make: "Ford", model: "Kuga", year: 2023, price: 295000, priceFormatted: "295 000 DH", km: 20000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Ford Fiesta 2022", make: "Ford", model: "Fiesta", year: 2022, price: 165000, priceFormatted: "165 000 DH", km: 30000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Agadir", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Nissan
  { title: "Nissan Qashqai 1.3 DIG-T 2024", make: "Nissan", model: "Qashqai", year: 2024, price: 310000, priceFormatted: "310 000 DH", km: 4000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Nissan Juke 2023", make: "Nissan", model: "Juke", year: 2023, price: 235000, priceFormatted: "235 000 DH", km: 15000, fuel: "Essence", transmission: "Automatique", bodyType: "Crossover", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Fiat
  { title: "Fiat Tipo 1.6 Multijet 2023", make: "Fiat", model: "Tipo", year: 2023, price: 195000, priceFormatted: "195 000 DH", km: 22000, fuel: "Diesel", transmission: "Automatique", bodyType: "Berline", city: "Fès", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Fiat 500 2024", make: "Fiat", model: "500", year: 2024, price: 185000, priceFormatted: "185 000 DH", km: 3000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Citroën
  { title: "Citroën C3 2024", make: "Citroën", model: "C3", year: 2024, price: 165000, priceFormatted: "165 000 DH", km: 4000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Citroën C5 Aircross 2023", make: "Citroën", model: "C5 Aircross", year: 2023, price: 310000, priceFormatted: "310 000 DH", km: 18000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Opel
  { title: "Opel Corsa 2024", make: "Opel", model: "Corsa", year: 2024, price: 175000, priceFormatted: "175 000 DH", km: 3000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Opel Grandland 2024", make: "Opel", model: "Grandland", year: 2024, price: 335000, priceFormatted: "335 000 DH", km: 5000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Jeep
  { title: "Jeep Renegade 2.0 CRDi 2023", make: "Jeep", model: "Renegade", year: 2023, price: 295000, priceFormatted: "295 000 DH", km: 20000, fuel: "Diesel", transmission: "Automatique", bodyType: "SUV", city: "El Jadida", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Skoda
  { title: "Škoda Octavia 2024", make: "Škoda", model: "Octavia", year: 2024, price: 285000, priceFormatted: "285 000 DH", km: 4000, fuel: "Diesel", transmission: "Automatique", bodyType: "Berline", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Seat
  { title: "SEAT Leon FR 2024", make: "Seat", model: "Leon", year: 2024, price: 280000, priceFormatted: "280 000 DH", km: 3000, fuel: "Essence", transmission: "Automatique", bodyType: "Compacte", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "SEAT Ibiza 2023", make: "Seat", model: "Ibiza", year: 2023, price: 185000, priceFormatted: "185 000 DH", km: 12000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Suzuki
  { title: "Suzuki Vitara Hybrid 2024", make: "Suzuki", model: "Vitara", year: 2024, price: 235000, priceFormatted: "235 000 DH", km: 2000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Marrakech", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Volvo
  { title: "Volvo XC40 B4 2024", make: "Volvo", model: "XC40", year: 2024, price: 420000, priceFormatted: "420 000 DH", km: 3000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // DFSK - Le chinois abordable
  { title: "DFSK E5 PHEV 2024", make: "DFSK", model: "E5", year: 2024, price: 255000, priceFormatted: "255 000 DH", km: 1000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Mazda
  { title: "Mazda CX-30 2.0 2024", make: "Mazda", model: "CX-30", year: 2024, price: 285000, priceFormatted: "285 000 DH", km: 3000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", city: "Rabat", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },

  // Occasion populaire
  { title: "Renault Clio IV 2019", make: "Renault", model: "Clio", year: 2019, price: 95000, priceFormatted: "95 000 DH", km: 75000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Casablanca", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Peugeot 206 Plus 2018", make: "Peugeot", model: "206", year: 2018, price: 65000, priceFormatted: "65 000 DH", km: 95000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Fès", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Dacia Logan MCV 2020", make: "Dacia", model: "Logan", year: 2020, price: 85000, priceFormatted: "85 000 DH", km: 65000, fuel: "Diesel", transmission: "Manuelle", bodyType: "Break", city: "Tanger", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Hyundai i10 2021", make: "Hyundai", model: "i10", year: 2021, price: 89000, priceFormatted: "89 000 DH", km: 40000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Agadir", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
  { title: "Kia Picanto 2020", make: "Kia", model: "Picanto", year: 2020, price: 72000, priceFormatted: "72 000 DH", km: 48000, fuel: "Essence", transmission: "Manuelle", bodyType: "Citadine", city: "Meknès", image: "", source: "Données Maroc", sourceUrl: "#", url: "#", photos: [] },
];

export function getFallbackCars(): UnifiedCar[] {
  return MOROCCAN_CARS.map((car) => {
    return {
      ...car,
      image: "",
      id: generateId("fallback", car.make, car.model, car.year, car.km, car.price),
      score: computeScore(car.year, car.km, car.price),
      scrapedAt: new Date().toISOString(),
      photos: [],
      inventoryType: "used" as const,
      safety: null,
    };
  });
}
