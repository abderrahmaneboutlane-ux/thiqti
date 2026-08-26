import { UnifiedCar, SourceCollector, generateId, normalizeBrand } from "./types";

// autoevolution CDN blocked (hotlink protection returns empty body)
// Official brands use SVG illustrations (CarIllustration component)

interface OfficialModel {
  brand: string;
  model: string;
  price: number;
  fuel: string;
  bodyType: string;
  cdnKey: string;
  transmission: string;
}

const OFFICIAL_CARS: OfficialModel[] = [
  // Dacia - Le leader marocain
  { brand: "Dacia", model: "Sandero", price: 149900, fuel: "Essence", bodyType: "Citadine", cdnKey: "DACIA_Sandero", transmission: "Manuelle" },
  { brand: "Dacia", model: "Sandero Stepway", price: 172900, fuel: "Essence", bodyType: "Crossover", cdnKey: "DACIA_Sandero", transmission: "Manuelle" },
  { brand: "Dacia", model: "Logan", price: 169900, fuel: "Essence", bodyType: "Berline", cdnKey: "DACIA_Logan", transmission: "Manuelle" },
  { brand: "Dacia", model: "Logan CVT", price: 189900, fuel: "Essence", bodyType: "Berline", cdnKey: "DACIA_Logan", transmission: "Automatique" },
  { brand: "Dacia", model: "Duster", price: 219900, fuel: "Essence", bodyType: "SUV", cdnKey: "DACIA_Duster", transmission: "Manuelle" },
  { brand: "Dacia", model: "Duster AT", price: 249900, fuel: "Essence", bodyType: "SUV", cdnKey: "DACIA_Duster", transmission: "Automatique" },
  { brand: "Dacia", model: "Jogger", price: 199900, fuel: "Essence", bodyType: "Monospace", cdnKey: "DACIA_Jogger", transmission: "Manuelle" },
  { brand: "Dacia", model: "Jogger Hybrid", price: 249900, fuel: "Hybride", bodyType: "Monospace", cdnKey: "DACIA_Jogger", transmission: "Automatique" },
  { brand: "Dacia", model: "Spring", price: 139900, fuel: "Électrique", bodyType: "Citadine", cdnKey: "DACIA_Spring", transmission: "Automatique" },

  // Renault
  { brand: "Renault", model: "Clio", price: 215000, fuel: "Essence", bodyType: "Citadine", cdnKey: "RENAULT_Clio", transmission: "Automatique" },
  { brand: "Renault", model: "Clio E-Tech", price: 249000, fuel: "Hybride", bodyType: "Citadine", cdnKey: "RENAULT_Clio", transmission: "Automatique" },
  { brand: "Renault", model: "Megane E-TECH", price: 319000, fuel: "Électrique", bodyType: "Berline", cdnKey: "RENAULT_Megane", transmission: "Automatique" },
  { brand: "Renault", model: "Austral", price: 349000, fuel: "Hybride", bodyType: "SUV", cdnKey: "RENAULT_Austral", transmission: "Automatique" },
  { brand: "Renault", model: "Kardian", price: 239000, fuel: "Essence", bodyType: "Crossover", cdnKey: "RENAULT_Kardian", transmission: "Automatique" },
  { brand: "Renault", model: "Duster", price: 199000, fuel: "Diesel", bodyType: "SUV", cdnKey: "RENAULT_Duster", transmission: "Manuelle" },
  { brand: "Renault", model: "Symbol", price: 129000, fuel: "Essence", bodyType: "Berline", cdnKey: "RENAULT_Symbol", transmission: "Manuelle" },
  { brand: "Renault", model: "Captur", price: 229000, fuel: "Essence", bodyType: "Crossover", cdnKey: "RENAULT_Captur", transmission: "Automatique" },

  // Peugeot
  { brand: "Peugeot", model: "208", price: 205000, fuel: "Essence", bodyType: "Citadine", cdnKey: "PEUGEOT_208", transmission: "Manuelle" },
  { brand: "Peugeot", model: "208 GT", price: 245000, fuel: "Essence", bodyType: "Citadine", cdnKey: "PEUGEOT_208", transmission: "Automatique" },
  { brand: "Peugeot", model: "2008", price: 265000, fuel: "Essence", bodyType: "SUV", cdnKey: "PEUGEOT_2008", transmission: "Automatique" },
  { brand: "Peugeot", model: "308", price: 295000, fuel: "Diesel", bodyType: "Compacte", cdnKey: "PEUGEOT_308", transmission: "Automatique" },
  { brand: "Peugeot", model: "3008", price: 375000, fuel: "Hybride", bodyType: "SUV", cdnKey: "PEUGEOT_3008", transmission: "Automatique" },
  { brand: "Peugeot", model: "408", price: 345000, fuel: "Essence", bodyType: "Crossover", cdnKey: "PEUGEOT_408", transmission: "Automatique" },
  { brand: "Peugeot", model: "508", price: 395000, fuel: "Diesel", bodyType: "Berline", cdnKey: "PEUGEOT_508", transmission: "Automatique" },
  { brand: "Peugeot", model: "Rifter", price: 285000, fuel: "Diesel", bodyType: "Monospace", cdnKey: "PEUGEOT_Rifter", transmission: "Manuelle" },

  // Toyota
  { brand: "Toyota", model: "Yaris", price: 215000, fuel: "Hybride", bodyType: "Citadine", cdnKey: "TOYOTA_Yaris", transmission: "Automatique" },
  { brand: "Toyota", model: "Yaris Cross", price: 285000, fuel: "Hybride", bodyType: "SUV", cdnKey: "TOYOTA_Yaris_Cross", transmission: "Automatique" },
  { brand: "Toyota", model: "Corolla", price: 289000, fuel: "Hybride", bodyType: "Berline", cdnKey: "TOYOTA_Corolla", transmission: "Automatique" },
  { brand: "Toyota", model: "C-HR", price: 295000, fuel: "Hybride", bodyType: "SUV", cdnKey: "TOYOTA_C-HR", transmission: "Automatique" },
  { brand: "Toyota", model: "RAV4", price: 389000, fuel: "Hybride", bodyType: "SUV", cdnKey: "TOYOTA_RAV4", transmission: "Automatique" },
  { brand: "Toyota", model: "Hilux", price: 345000, fuel: "Diesel", bodyType: "Pick-up", cdnKey: "TOYOTA_Hilux", transmission: "Manuelle" },
  { brand: "Toyota", model: "Land Cruiser", price: 599000, fuel: "Diesel", bodyType: "SUV", cdnKey: "TOYOTA_Land_Cruiser", transmission: "Automatique" },

  // Hyundai
  { brand: "Hyundai", model: "i10", price: 149000, fuel: "Essence", bodyType: "Citadine", cdnKey: "HYUNDAI_i10", transmission: "Manuelle" },
  { brand: "Hyundai", model: "i20", price: 189000, fuel: "Essence", bodyType: "Compacte", cdnKey: "HYUNDAI_i20", transmission: "Manuelle" },
  { brand: "Hyundai", model: "Bayon", price: 199000, fuel: "Essence", bodyType: "Crossover", cdnKey: "HYUNDAI_Bayon", transmission: "Automatique" },
  { brand: "Hyundai", model: "Kona", price: 275000, fuel: "Hybride", bodyType: "SUV", cdnKey: "HYUNDAI_Kona", transmission: "Automatique" },
  { brand: "Hyundai", model: "Tucson", price: 359900, fuel: "Hybride", bodyType: "SUV", cdnKey: "HYUNDAI_Tucson", transmission: "Automatique" },
  { brand: "Hyundai", model: "Ioniq 5", price: 499000, fuel: "Électrique", bodyType: "SUV", cdnKey: "HYUNDAI_Ioniq-5", transmission: "Automatique" },
  { brand: "Hyundai", model: "Santa Fe", price: 449000, fuel: "Hybride", bodyType: "SUV", cdnKey: "HYUNDAI_Santa-Fe", transmission: "Automatique" },

  // Kia
  { brand: "Kia", model: "Picanto", price: 138000, fuel: "Essence", bodyType: "Citadine", cdnKey: "KIA_Picanto", transmission: "Manuelle" },
  { brand: "Kia", model: "Stonic", price: 215000, fuel: "Essence", bodyType: "Crossover", cdnKey: "KIA_Stonic", transmission: "Automatique" },
  { brand: "Kia", model: "Niro", price: 309000, fuel: "Hybride", bodyType: "SUV", cdnKey: "KIA_Niro", transmission: "Automatique" },
  { brand: "Kia", model: "Sportage", price: 345000, fuel: "Diesel", bodyType: "SUV", cdnKey: "KIA_Sportage", transmission: "Automatique" },
  { brand: "Kia", model: "Ceed", price: 259000, fuel: "Essence", bodyType: "Compacte", cdnKey: "KIA_Ceed", transmission: "Automatique" },
  { brand: "Kia", model: "EV6", price: 549000, fuel: "Électrique", bodyType: "SUV", cdnKey: "KIA_EV6", transmission: "Automatique" },
  { brand: "Kia", model: "Sorento", price: 465000, fuel: "Hybride", bodyType: "SUV", cdnKey: "KIA_Sorento", transmission: "Automatique" },

  // Volkswagen
  { brand: "Volkswagen", model: "Polo", price: 205000, fuel: "Essence", bodyType: "Citadine", cdnKey: "VOLKSWAGEN_Polo", transmission: "Manuelle" },
  { brand: "Volkswagen", model: "Golf", price: 340000, fuel: "Essence", bodyType: "Compacte", cdnKey: "VOLKSWAGEN_Golf", transmission: "Automatique" },
  { brand: "Volkswagen", model: "T-Cross", price: 235000, fuel: "Essence", bodyType: "SUV", cdnKey: "VOLKSWAGEN_T-Cross", transmission: "Automatique" },
  { brand: "Volkswagen", model: "T-Roc", price: 315000, fuel: "Essence", bodyType: "Crossover", cdnKey: "VOLKSWAGEN_T-Roc", transmission: "Automatique" },
  { brand: "Volkswagen", model: "Tiguan", price: 395000, fuel: "Diesel", bodyType: "SUV", cdnKey: "VOLKSWAGEN_Tiguan", transmission: "Automatique" },
  { brand: "Volkswagen", model: "ID.4", price: 525000, fuel: "Électrique", bodyType: "SUV", cdnKey: "VOLKSWAGEN_ID.4", transmission: "Automatique" },
  { brand: "Volkswagen", model: "Passat", price: 420000, fuel: "Diesel", bodyType: "Berline", cdnKey: "VOLKSWAGEN_Passat", transmission: "Automatique" },

  // Ford
  { brand: "Ford", model: "Puma", price: 239000, fuel: "Essence", bodyType: "Crossover", cdnKey: "FORD_Puma", transmission: "Automatique" },
  { brand: "Ford", model: "Kuga", price: 299000, fuel: "Diesel", bodyType: "SUV", cdnKey: "FORD_Kuga", transmission: "Automatique" },
  { brand: "Ford", model: "Ranger", price: 399000, fuel: "Diesel", bodyType: "Pick-up", cdnKey: "FORD_Ranger", transmission: "Automatique" },
  { brand: "Ford", model: "Mustang Mach-E", price: 599000, fuel: "Électrique", bodyType: "SUV", cdnKey: "FORD_Mustang-Mach-E", transmission: "Automatique" },
  { brand: "Ford", model: "Explorer", price: 499000, fuel: "Hybride", bodyType: "SUV", cdnKey: "FORD_Explorer", transmission: "Automatique" },

  // Nissan
  { brand: "Nissan", model: "Juke", price: 235000, fuel: "Essence", bodyType: "Crossover", cdnKey: "NISSAN_Juke", transmission: "Automatique" },
  { brand: "Nissan", model: "Qashqai", price: 310000, fuel: "Essence", bodyType: "SUV", cdnKey: "NISSAN_Qashqai", transmission: "Automatique" },
  { brand: "Nissan", model: "X-Trail", price: 375000, fuel: "Hybride", bodyType: "SUV", cdnKey: "NISSAN_X-Trail", transmission: "Automatique" },
  { brand: "Nissan", model: "Leaf", price: 399000, fuel: "Électrique", bodyType: "Berline", cdnKey: "NISSAN_Leaf", transmission: "Automatique" },
  { brand: "Nissan", model: "Micra", price: 179000, fuel: "Essence", bodyType: "Citadine", cdnKey: "NISSAN_Micra", transmission: "Manuelle" },

  // Fiat
  { brand: "Fiat", model: "500", price: 185000, fuel: "Essence", bodyType: "Citadine", cdnKey: "FIAT_500", transmission: "Automatique" },
  { brand: "Fiat", model: "Tipo", price: 195000, fuel: "Diesel", bodyType: "Berline", cdnKey: "FIAT_Tipo", transmission: "Automatique" },
  { brand: "Fiat", model: "500e", price: 329000, fuel: "Électrique", bodyType: "Citadine", cdnKey: "FIAT_500", transmission: "Automatique" },
  { brand: "Fiat", model: "Panda", price: 149000, fuel: "Essence", bodyType: "Citadine", cdnKey: "FIAT_Panda", transmission: "Manuelle" },

  // Citroën
  { brand: "Citroën", model: "C3", price: 165000, fuel: "Essence", bodyType: "Citadine", cdnKey: "CITROEN_C3", transmission: "Manuelle" },
  { brand: "Citroën", model: "C3 Aircross", price: 199000, fuel: "Essence", bodyType: "Crossover", cdnKey: "CITROEN_C3-Aircross", transmission: "Automatique" },
  { brand: "Citroën", model: "C4", price: 265000, fuel: "Essence", bodyType: "Crossover", cdnKey: "CITROEN_C4", transmission: "Automatique" },
  { brand: "Citroën", model: "C5 Aircross", price: 310000, fuel: "Diesel", bodyType: "SUV", cdnKey: "CITROEN_C5-Aircross", transmission: "Automatique" },
  { brand: "Citroën", model: "ë-C4 X", price: 359000, fuel: "Électrique", bodyType: "Berline", cdnKey: "CITROEN_eC4-X", transmission: "Automatique" },

  // Opel
  { brand: "Opel", model: "Corsa", price: 175000, fuel: "Essence", bodyType: "Citadine", cdnKey: "OPEL_Corsa", transmission: "Manuelle" },
  { brand: "Opel", model: "Mokka", price: 255000, fuel: "Essence", bodyType: "SUV", cdnKey: "OPEL_Mokka", transmission: "Automatique" },
  { brand: "Opel", model: "Crossland", price: 225000, fuel: "Essence", bodyType: "SUV", cdnKey: "OPEL_Crossland", transmission: "Automatique" },
  { brand: "Opel", model: "Grandland", price: 335000, fuel: "Diesel", bodyType: "SUV", cdnKey: "OPEL_Grandland", transmission: "Automatique" },
  { brand: "Opel", model: "Astra", price: 285000, fuel: "Essence", bodyType: "Compacte", cdnKey: "OPEL_Astra", transmission: "Automatique" },

  // Honda
  { brand: "Honda", model: "Jazz", price: 225000, fuel: "Hybride", bodyType: "Citadine", cdnKey: "HONDA_Jazz", transmission: "Automatique" },
  { brand: "Honda", model: "Civic", price: 345000, fuel: "Hybride", bodyType: "Compacte", cdnKey: "HONDA_Civic", transmission: "Automatique" },
  { brand: "Honda", model: "HR-V", price: 295000, fuel: "Hybride", bodyType: "SUV", cdnKey: "HONDA_HR-V", transmission: "Automatique" },
  { brand: "Honda", model: "CR-V", price: 425000, fuel: "Hybride", bodyType: "SUV", cdnKey: "HONDA_CR-V", transmission: "Automatique" },
  { brand: "Honda", model: "ZR-V", price: 365000, fuel: "Hybride", bodyType: "SUV", cdnKey: "HONDA_ZR-V", transmission: "Automatique" },

  // BMW
  { brand: "BMW", model: "Série 1", price: 395000, fuel: "Essence", bodyType: "Compacte", cdnKey: "BMW_Serie-1", transmission: "Automatique" },
  { brand: "BMW", model: "Série 3", price: 545000, fuel: "Diesel", bodyType: "Berline", cdnKey: "BMW_Serie-3", transmission: "Automatique" },
  { brand: "BMW", model: "X1", price: 495000, fuel: "Diesel", bodyType: "SUV", cdnKey: "BMW_X1", transmission: "Automatique" },
  { brand: "BMW", model: "X3", price: 620000, fuel: "Diesel", bodyType: "SUV", cdnKey: "BMW_X3", transmission: "Automatique" },
  { brand: "BMW", model: "iX1", price: 565000, fuel: "Électrique", bodyType: "SUV", cdnKey: "BMW_iX1", transmission: "Automatique" },
  { brand: "BMW", model: "X5", price: 895000, fuel: "Diesel", bodyType: "SUV", cdnKey: "BMW_X5", transmission: "Automatique" },

  // Mercedes
  { brand: "Mercedes", model: "Classe A", price: 420000, fuel: "Essence", bodyType: "Compacte", cdnKey: "MERCEDES_Classe-A", transmission: "Automatique" },
  { brand: "Mercedes", model: "Classe C", price: 595000, fuel: "Diesel", bodyType: "Berline", cdnKey: "MERCEDES_Classe-C", transmission: "Automatique" },
  { brand: "Mercedes", model: "GLA", price: 475000, fuel: "Essence", bodyType: "SUV", cdnKey: "MERCEDES_GLA", transmission: "Automatique" },
  { brand: "Mercedes", model: "GLB", price: 520000, fuel: "Diesel", bodyType: "SUV", cdnKey: "MERCEDES_GLB", transmission: "Automatique" },
  { brand: "Mercedes", model: "GLC", price: 650000, fuel: "Diesel", bodyType: "SUV", cdnKey: "MERCEDES_GLC", transmission: "Automatique" },
  { brand: "Mercedes", model: "EQA", price: 545000, fuel: "Électrique", bodyType: "SUV", cdnKey: "MERCEDES_EQA", transmission: "Automatique" },
  { brand: "Mercedes", model: "EQB", price: 595000, fuel: "Électrique", bodyType: "SUV", cdnKey: "MERCEDES_EQB", transmission: "Automatique" },

  // BYD
  { brand: "BYD", model: "ATTO 3", price: 355900, fuel: "Électrique", bodyType: "SUV", cdnKey: "BYD_ATTO-3", transmission: "Automatique" },
  { brand: "BYD", model: "Seal U", price: 359900, fuel: "Hybride", bodyType: "SUV", cdnKey: "BYD_Seal-U", transmission: "Automatique" },
  { brand: "BYD", model: "Dolphin", price: 269900, fuel: "Électrique", bodyType: "Citadine", cdnKey: "BYD_Dolphin", transmission: "Automatique" },

  // MG
  { brand: "MG", model: "HS", price: 269000, fuel: "Hybride", bodyType: "SUV", cdnKey: "MG_HS", transmission: "Automatique" },
  { brand: "MG", model: "ZS EV", price: 299000, fuel: "Électrique", bodyType: "SUV", cdnKey: "MG_ZS-EV", transmission: "Automatique" },
  { brand: "MG", model: "MG5", price: 189000, fuel: "Essence", bodyType: "Berline", cdnKey: "MG_MG5", transmission: "Automatique" },

  // Suzuki
  { brand: "Suzuki", model: "Vitara", price: 235000, fuel: "Hybride", bodyType: "SUV", cdnKey: "SUZUKI_Vitara", transmission: "Automatique" },
  { brand: "Suzuki", model: "Swift", price: 165000, fuel: "Essence", bodyType: "Citadine", cdnKey: "SUZUKI_Swift", transmission: "Manuelle" },
  { brand: "Suzuki", model: "Jimny", price: 219000, fuel: "Essence", bodyType: "SUV", cdnKey: "SUZUKI_Jimny", transmission: "Manuelle" },
  { brand: "Suzuki", model: "S-Cross", price: 249000, fuel: "Hybride", bodyType: "SUV", cdnKey: "SUZUKI_S-Cross", transmission: "Automatique" },

  // Changan
  { brand: "Changan", model: "CS35 Plus", price: 179900, fuel: "Essence", bodyType: "SUV", cdnKey: "CHANGAN_CS35-Plus", transmission: "Automatique" },
  { brand: "Changan", model: "CS55 Plus", price: 219900, fuel: "Essence", bodyType: "SUV", cdnKey: "CHANGAN_CS55-Plus", transmission: "Automatique" },
  { brand: "Changan", model: "UNI-T", price: 269900, fuel: "Essence", bodyType: "SUV", cdnKey: "CHANGAN_UNI-T", transmission: "Automatique" },

  // Chery
  { brand: "Chery", model: "Tiggo 4", price: 169900, fuel: "Essence", bodyType: "SUV", cdnKey: "CHERY_Tiggo-4", transmission: "Automatique" },
  { brand: "Chery", model: "Tiggo 7", price: 219900, fuel: "Essence", bodyType: "SUV", cdnKey: "CHERY_Tiggo-7", transmission: "Automatique" },
  { brand: "Chery", model: "Tiggo 8", price: 269900, fuel: "Essence", bodyType: "SUV", cdnKey: "CHERY_Tiggo-8", transmission: "Automatique" },

  // DFSK
  { brand: "DFSK", model: "E5", price: 255000, fuel: "Hybride", bodyType: "SUV", cdnKey: "DFSK_E5", transmission: "Automatique" },
  { brand: "DFSK", model: "Glory 580", price: 209900, fuel: "Essence", bodyType: "SUV", cdnKey: "DFSK_Glory-580", transmission: "Automatique" },

  // JAC
  { brand: "JAC", model: "S2", price: 139900, fuel: "Essence", bodyType: "SUV", cdnKey: "JAC_S2", transmission: "Automatique" },
  { brand: "JAC", model: "S3", price: 165000, fuel: "Essence", bodyType: "SUV", cdnKey: "JAC_S3", transmission: "Automatique" },

  // Geely
  { brand: "Geely", model: "Coolray", price: 199900, fuel: "Essence", bodyType: "SUV", cdnKey: "GEELY_Coolray", transmission: "Automatique" },
  { brand: "Geely", model: "Emgrand", price: 169900, fuel: "Essence", bodyType: "Berline", cdnKey: "GEELY_Emgrand", transmission: "Automatique" },

  // Haval
  { brand: "Haval", model: "Jolion", price: 199900, fuel: "Essence", bodyType: "SUV", cdnKey: "HAVAL_Jolion", transmission: "Automatique" },
  { brand: "Haval", model: "H6", price: 299900, fuel: "Essence", bodyType: "SUV", cdnKey: "HAVAL_H6", transmission: "Automatique" },

  // Omoda
  { brand: "Omoda", model: "C5", price: 219900, fuel: "Essence", bodyType: "SUV", cdnKey: "OMODA_C5", transmission: "Automatique" },

  // Volvo
  { brand: "Volvo", model: "XC40", price: 420000, fuel: "Hybride", bodyType: "SUV", cdnKey: "VOLVO_XC40", transmission: "Automatique" },
  { brand: "Volvo", model: "XC60", price: 565000, fuel: "Hybride", bodyType: "SUV", cdnKey: "VOLVO_XC60", transmission: "Automatique" },

  // Mazda
  { brand: "Mazda", model: "CX-30", price: 285000, fuel: "Essence", bodyType: "SUV", cdnKey: "MAZDA_CX-30", transmission: "Automatique" },
  { brand: "Mazda", model: "CX-5", price: 365000, fuel: "Diesel", bodyType: "SUV", cdnKey: "MAZDA_CX-5", transmission: "Automatique" },
];

export class OfficialBrandsCollector implements SourceCollector {
  name = "Marques Officielles";

  async fetch(): Promise<UnifiedCar[]> {
    const cars: UnifiedCar[] = OFFICIAL_CARS.map((m) => ({
      id: generateId("official", m.brand, m.model, 2025, 0, m.price),
      title: `${m.brand} ${m.model} Neuf`,
      make: normalizeBrand(m.brand),
      model: m.model,
      year: 2025,
      price: m.price,
      priceFormatted: m.price.toLocaleString("fr-FR") + " DH",
      km: 0,
      fuel: m.fuel,
      transmission: m.transmission,
      bodyType: m.bodyType,
      city: "Maroc",
      image: "",
      source: "Marques Officielles",
      sourceUrl: "",
      url: "",
      score: 95,
      scrapedAt: new Date().toISOString(),
      photos: [],
      inventoryType: "new" as const,
      safety: null,
    }));

    console.log(`[Marques Officielles] ${cars.length} vehicules`);
    return cars;
  }
}
