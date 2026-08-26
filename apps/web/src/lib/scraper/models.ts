import { normalizeBrand } from "@/lib/sources/types";

export interface ModelReference {
  brand: string;
  canonicalModel: string;
  aliases: string[];
  bodyType: string;
  fuelDefault: string;
  transmissionDefault: string;
  priceRangeNew: { min: number; max: number };
  priceRangeUsed: { min: number; max: number };
}

const MODELS_CATALOG: ModelReference[] = [
  {
    brand: "Dacia",
    canonicalModel: "Logan",
    aliases: ["logan", "logan mcv", "logan II", "logan II mcv"],
    bodyType: "Berline",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 149_900, max: 210_000 },
    priceRangeUsed: { min: 50_000, max: 160_000 },
  },
  {
    brand: "Dacia",
    canonicalModel: "Sandero",
    aliases: ["sandero", "sandero stepway", "sandero II", "sandero stepway II"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 149_900, max: 210_000 },
    priceRangeUsed: { min: 45_000, max: 150_000 },
  },
  {
    brand: "Dacia",
    canonicalModel: "Duster",
    aliases: ["duster", "duster II", "duster 4x4", "duster stepway"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 199_900, max: 320_000 },
    priceRangeUsed: { min: 80_000, max: 260_000 },
  },
  {
    brand: "Dacia",
    canonicalModel: "Spring",
    aliases: ["spring", "spring electric", "spring cargo"],
    bodyType: "Citadine",
    fuelDefault: "Électrique",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 199_900, max: 260_000 },
    priceRangeUsed: { min: 100_000, max: 200_000 },
  },
  {
    brand: "Renault",
    canonicalModel: "Clio",
    aliases: ["clio", "clio IV", "clio V", "clio estate"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 179_900, max: 280_000 },
    priceRangeUsed: { min: 55_000, max: 210_000 },
  },
  {
    brand: "Renault",
    canonicalModel: "Captur",
    aliases: ["captur", "captur II", "captur cross edition"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 219_900, max: 330_000 },
    priceRangeUsed: { min: 100_000, max: 260_000 },
  },
  {
    brand: "Renault",
    canonicalModel: "Megane",
    aliases: ["megane", "megane IV", "megane sedan", "megane estate", "megane grandtour"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 229_900, max: 350_000 },
    priceRangeUsed: { min: 70_000, max: 270_000 },
  },
  {
    brand: "Renault",
    canonicalModel: "Duster",
    aliases: ["duster", "duster II", "duster 4x4", "duster stepway"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 209_900, max: 330_000 },
    priceRangeUsed: { min: 85_000, max: 270_000 },
  },
  {
    brand: "Renault",
    canonicalModel: "Kangoo",
    aliases: ["kangoo", "kangoo II", "kangoo express", "kangoo van"],
    bodyType: "Utilitaire",
    fuelDefault: "Diesel",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 199_900, max: 290_000 },
    priceRangeUsed: { min: 60_000, max: 200_000 },
  },
  {
    brand: "Renault",
    canonicalModel: "Austral",
    aliases: ["austral"],
    bodyType: "SUV",
    fuelDefault: "Hybride",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 319_900, max: 420_000 },
    priceRangeUsed: { min: 220_000, max: 380_000 },
  },
  {
    brand: "Peugeot",
    canonicalModel: "208",
    aliases: ["208", "208 II"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 189_900, max: 280_000 },
    priceRangeUsed: { min: 60_000, max: 220_000 },
  },
  {
    brand: "Peugeot",
    canonicalModel: "2008",
    aliases: ["2008", "2008 II"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 219_900, max: 330_000 },
    priceRangeUsed: { min: 100_000, max: 270_000 },
  },
  {
    brand: "Peugeot",
    canonicalModel: "308",
    aliases: ["308", "308 II", "308 sedan", "308 estate"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 249_900, max: 380_000 },
    priceRangeUsed: { min: 80_000, max: 300_000 },
  },
  {
    brand: "Peugeot",
    canonicalModel: "3008",
    aliases: ["3008", "3008 II", "3008 GT"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 299_900, max: 450_000 },
    priceRangeUsed: { min: 140_000, max: 380_000 },
  },
  {
    brand: "Peugeot",
    canonicalModel: "5008",
    aliases: ["5008", "5008 II"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 349_900, max: 500_000 },
    priceRangeUsed: { min: 180_000, max: 420_000 },
  },
  {
    brand: "Volkswagen",
    canonicalModel: "Polo",
    aliases: ["polo", "polo VI"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 219_900, max: 310_000 },
    priceRangeUsed: { min: 70_000, max: 240_000 },
  },
  {
    brand: "Volkswagen",
    canonicalModel: "Golf",
    aliases: ["golf", "golf VII", "golf VIII", "golf GTI"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 289_900, max: 420_000 },
    priceRangeUsed: { min: 100_000, max: 350_000 },
  },
  {
    brand: "Volkswagen",
    canonicalModel: "T-Cross",
    aliases: ["t-cross", "tcross"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 249_900, max: 340_000 },
    priceRangeUsed: { min: 130_000, max: 300_000 },
  },
  {
    brand: "Volkswagen",
    canonicalModel: "T-Roc",
    aliases: ["t-roc", "troc"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 299_900, max: 420_000 },
    priceRangeUsed: { min: 170_000, max: 360_000 },
  },
  {
    brand: "Volkswagen",
    canonicalModel: "Tiguan",
    aliases: ["tiguan", "tiguan II", "tiguan allspace"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 369_900, max: 520_000 },
    priceRangeUsed: { min: 200_000, max: 440_000 },
  },
  {
    brand: "Hyundai",
    canonicalModel: "i10",
    aliases: ["i10", "i10 II", "grand i10"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 149_900, max: 200_000 },
    priceRangeUsed: { min: 45_000, max: 150_000 },
  },
  {
    brand: "Hyundai",
    canonicalModel: "i20",
    aliases: ["i20", "i20 II", "i20 active"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 179_900, max: 260_000 },
    priceRangeUsed: { min: 60_000, max: 200_000 },
  },
  {
    brand: "Hyundai",
    canonicalModel: "Tucson",
    aliases: ["tucson", "tucson IV"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 349_900, max: 500_000 },
    priceRangeUsed: { min: 180_000, max: 420_000 },
  },
  {
    brand: "Hyundai",
    canonicalModel: "Kona",
    aliases: ["kona", "kona electric"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 269_900, max: 380_000 },
    priceRangeUsed: { min: 140_000, max: 320_000 },
  },
  {
    brand: "Hyundai",
    canonicalModel: "Bayon",
    aliases: ["bayon"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 199_900, max: 280_000 },
    priceRangeUsed: { min: 100_000, max: 240_000 },
  },
  {
    brand: "Kia",
    canonicalModel: "Picanto",
    aliases: ["picanto", "picanto II", "picanto III"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 139_900, max: 190_000 },
    priceRangeUsed: { min: 40_000, max: 140_000 },
  },
  {
    brand: "Kia",
    canonicalModel: "Stonic",
    aliases: ["stonic"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 219_900, max: 310_000 },
    priceRangeUsed: { min: 110_000, max: 260_000 },
  },
  {
    brand: "Kia",
    canonicalModel: "Sportage",
    aliases: ["sportage", "sportage V", "sportage VI"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 329_900, max: 480_000 },
    priceRangeUsed: { min: 150_000, max: 400_000 },
  },
  {
    brand: "Kia",
    canonicalModel: "Niro",
    aliases: ["niro", "niro hybrid", "niro plug-in"],
    bodyType: "SUV",
    fuelDefault: "Hybride",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 299_900, max: 420_000 },
    priceRangeUsed: { min: 180_000, max: 360_000 },
  },
  {
    brand: "Toyota",
    canonicalModel: "Yaris",
    aliases: ["yaris", "yaris III", "yaris IV", "yaris cross"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 189_900, max: 260_000 },
    priceRangeUsed: { min: 60_000, max: 200_000 },
  },
  {
    brand: "Toyota",
    canonicalModel: "Corolla",
    aliases: ["corolla", "corolla sedan", "corolla touring"],
    bodyType: "Berline",
    fuelDefault: "Hybride",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 249_900, max: 360_000 },
    priceRangeUsed: { min: 120_000, max: 300_000 },
  },
  {
    brand: "Toyota",
    canonicalModel: "C-HR",
    aliases: ["c-hr", "chr"],
    bodyType: "Crossover",
    fuelDefault: "Hybride",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 279_900, max: 400_000 },
    priceRangeUsed: { min: 160_000, max: 340_000 },
  },
  {
    brand: "Toyota",
    canonicalModel: "RAV4",
    aliases: ["rav4", "rav 4", "rav4 v"],
    bodyType: "SUV",
    fuelDefault: "Hybride",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 369_900, max: 520_000 },
    priceRangeUsed: { min: 200_000, max: 450_000 },
  },
  {
    brand: "Toyota",
    canonicalModel: "Aygo",
    aliases: ["aygo", "aygo x"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 139_900, max: 190_000 },
    priceRangeUsed: { min: 35_000, max: 130_000 },
  },
  {
    brand: "Citroën",
    canonicalModel: "C3",
    aliases: ["c3", "c3 II", "c3 III", "c3 aircross"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 169_900, max: 240_000 },
    priceRangeUsed: { min: 50_000, max: 180_000 },
  },
  {
    brand: "Citroën",
    canonicalModel: "C4",
    aliases: ["c4", "c4 II", "c4 x", "c4 cactus"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 229_900, max: 340_000 },
    priceRangeUsed: { min: 80_000, max: 270_000 },
  },
  {
    brand: "Citroën",
    canonicalModel: "C5 Aircross",
    aliases: ["c5 aircross", "c5"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 319_900, max: 460_000 },
    priceRangeUsed: { min: 180_000, max: 400_000 },
  },
  {
    brand: "Citroën",
    canonicalModel: "Berlingo",
    aliases: ["berlingo", "berlingo multix", "berlingo III"],
    bodyType: "Utilitaire",
    fuelDefault: "Diesel",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 199_900, max: 290_000 },
    priceRangeUsed: { min: 70_000, max: 210_000 },
  },
  {
    brand: "Ford",
    canonicalModel: "Fiesta",
    aliases: ["fiesta", "fiesta VII", "fiesta VIII"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 189_900, max: 270_000 },
    priceRangeUsed: { min: 55_000, max: 200_000 },
  },
  {
    brand: "Ford",
    canonicalModel: "Focus",
    aliases: ["focus", "focus IV", "focus sedan"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 249_900, max: 360_000 },
    priceRangeUsed: { min: 80_000, max: 280_000 },
  },
  {
    brand: "Ford",
    canonicalModel: "Puma",
    aliases: ["puma"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 249_900, max: 350_000 },
    priceRangeUsed: { min: 140_000, max: 310_000 },
  },
  {
    brand: "Ford",
    canonicalModel: "Kuga",
    aliases: ["kuga", "kuga III"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 319_900, max: 450_000 },
    priceRangeUsed: { min: 160_000, max: 380_000 },
  },
  {
    brand: "Nissan",
    canonicalModel: "Micra",
    aliases: ["micra", "micra V"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 179_900, max: 250_000 },
    priceRangeUsed: { min: 55_000, max: 190_000 },
  },
  {
    brand: "Nissan",
    canonicalModel: "Juke",
    aliases: ["juke", "juke II"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 239_900, max: 340_000 },
    priceRangeUsed: { min: 120_000, max: 290_000 },
  },
  {
    brand: "Nissan",
    canonicalModel: "Qashqai",
    aliases: ["qashqai", "qashqai II", "qashqai+2"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 319_900, max: 460_000 },
    priceRangeUsed: { min: 150_000, max: 380_000 },
  },
  {
    brand: "Seat",
    canonicalModel: "Ibiza",
    aliases: ["ibiza", "ibiza IV", "ibiza V"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 189_900, max: 270_000 },
    priceRangeUsed: { min: 60_000, max: 210_000 },
  },
  {
    brand: "Seat",
    canonicalModel: "Arona",
    aliases: ["arona"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 219_900, max: 310_000 },
    priceRangeUsed: { min: 110_000, max: 260_000 },
  },
  {
    brand: "Seat",
    canonicalModel: "Leon",
    aliases: ["leon", "leon IV", "leon estate"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 249_900, max: 360_000 },
    priceRangeUsed: { min: 90_000, max: 290_000 },
  },
  {
    brand: "Fiat",
    canonicalModel: "500",
    aliases: ["500", "500 II", "500c", "500e"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 169_900, max: 260_000 },
    priceRangeUsed: { min: 55_000, max: 200_000 },
  },
  {
    brand: "Fiat",
    canonicalModel: "Panda",
    aliases: ["panda", "panda III", "panda 4x4"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 139_900, max: 190_000 },
    priceRangeUsed: { min: 35_000, max: 140_000 },
  },
  {
    brand: "Suzuki",
    canonicalModel: "Swift",
    aliases: ["swift", "swift IV", "swift V"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 159_900, max: 220_000 },
    priceRangeUsed: { min: 50_000, max: 170_000 },
  },
  {
    brand: "Suzuki",
    canonicalModel: "Vitara",
    aliases: ["vitara", "vitara II", "vitara grand"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 229_900, max: 330_000 },
    priceRangeUsed: { min: 100_000, max: 280_000 },
  },
  {
    brand: "Suzuki",
    canonicalModel: "Jimny",
    aliases: ["jimny", "jimny VII"],
    bodyType: "SUV",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 199_900, max: 260_000 },
    priceRangeUsed: { min: 120_000, max: 240_000 },
  },
  {
    brand: "Mazda",
    canonicalModel: "2",
    aliases: ["mazda 2", "2"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 189_900, max: 260_000 },
    priceRangeUsed: { min: 65_000, max: 200_000 },
  },
  {
    brand: "Mazda",
    canonicalModel: "3",
    aliases: ["mazda 3", "3", "mazda 3 sedan", "mazda 3 hatchback"],
    bodyType: "Compacte",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 259_900, max: 380_000 },
    priceRangeUsed: { min: 120_000, max: 320_000 },
  },
  {
    brand: "Mazda",
    canonicalModel: "CX-30",
    aliases: ["cx-30", "cx30"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 279_900, max: 390_000 },
    priceRangeUsed: { min: 160_000, max: 340_000 },
  },
  {
    brand: "Mazda",
    canonicalModel: "CX-5",
    aliases: ["cx-5", "cx5"],
    bodyType: "SUV",
    fuelDefault: "Diesel",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 349_900, max: 490_000 },
    priceRangeUsed: { min: 180_000, max: 420_000 },
  },
  {
    brand: "Changan",
    canonicalModel: "CS35",
    aliases: ["cs35", "cs35 plus"],
    bodyType: "SUV",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 169_900, max: 230_000 },
    priceRangeUsed: { min: 80_000, max: 180_000 },
  },
  {
    brand: "Changan",
    canonicalModel: "CS55",
    aliases: ["cs55", "cs55 plus"],
    bodyType: "SUV",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 209_900, max: 290_000 },
    priceRangeUsed: { min: 110_000, max: 240_000 },
  },
  {
    brand: "Changan",
    canonicalModel: "CS75",
    aliases: ["cs75", "cs75 plus"],
    bodyType: "SUV",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 249_900, max: 340_000 },
    priceRangeUsed: { min: 130_000, max: 290_000 },
  },
  {
    brand: "Changan",
    canonicalModel: "Alsvin",
    aliases: ["alsvin", "alsvin v5"],
    bodyType: "Berline",
    fuelDefault: "Essence",
    transmissionDefault: "Manuelle",
    priceRangeNew: { min: 139_900, max: 190_000 },
    priceRangeUsed: { min: 65_000, max: 150_000 },
  },
  {
    brand: "MG",
    canonicalModel: "MG3",
    aliases: ["mg3", "mg 3"],
    bodyType: "Citadine",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 149_900, max: 200_000 },
    priceRangeUsed: { min: 60_000, max: 160_000 },
  },
  {
    brand: "MG",
    canonicalModel: "ZS",
    aliases: ["zs", "mg zs"],
    bodyType: "Crossover",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 199_900, max: 290_000 },
    priceRangeUsed: { min: 100_000, max: 240_000 },
  },
  {
    brand: "MG",
    canonicalModel: "HS",
    aliases: ["hs", "mg hs"],
    bodyType: "SUV",
    fuelDefault: "Essence",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 269_900, max: 380_000 },
    priceRangeUsed: { min: 160_000, max: 320_000 },
  },
  {
    brand: "BYD",
    canonicalModel: "Dolphin",
    aliases: ["dolphin", "byd dolphin"],
    bodyType: "Citadine",
    fuelDefault: "Électrique",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 249_900, max: 340_000 },
    priceRangeUsed: { min: 180_000, max: 290_000 },
  },
  {
    brand: "BYD",
    canonicalModel: "Atto 3",
    aliases: ["atto 3", "atto3", "byd atto 3"],
    bodyType: "SUV",
    fuelDefault: "Électrique",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 329_900, max: 430_000 },
    priceRangeUsed: { min: 250_000, max: 380_000 },
  },
  {
    brand: "BYD",
    canonicalModel: "Seal",
    aliases: ["seal", "byd seal"],
    bodyType: "Berline",
    fuelDefault: "Électrique",
    transmissionDefault: "Automatique",
    priceRangeNew: { min: 429_900, max: 580_000 },
    priceRangeUsed: { min: 350_000, max: 500_000 },
  },
];

export function normalizeModel(
  brand: string,
  rawModel: string,
): { brand: string; model: string; bodyType: string } | null {
  const normalizedBrand = normalizeBrand(brand);
  const lower = rawModel.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "");

  for (const ref of MODELS_CATALOG) {
    if (ref.brand.toLowerCase() !== normalizedBrand.toLowerCase()) continue;

    if (ref.canonicalModel.toLowerCase() === lower) {
      return {
        brand: ref.brand,
        model: ref.canonicalModel,
        bodyType: ref.bodyType,
      };
    }

    for (const alias of ref.aliases) {
      const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normalizedInput = lower.replace(/[^a-z0-9]/g, "");
      if (normalizedAlias === normalizedInput) {
        return {
          brand: ref.brand,
          model: ref.canonicalModel,
          bodyType: ref.bodyType,
        };
      }
    }
  }

  const bestMatch = fuzzyMatchModel(lower, MODELS_CATALOG.filter((r) => r.brand.toLowerCase() === normalizedBrand.toLowerCase()).map((r) => r.canonicalModel));

  if (bestMatch) {
    const ref = MODELS_CATALOG.find(
      (r) => r.brand.toLowerCase() === normalizedBrand.toLowerCase() && r.canonicalModel === bestMatch,
    );
    if (ref) {
      return {
        brand: ref.brand,
        model: ref.canonicalModel,
        bodyType: ref.bodyType,
      };
    }
  }

  return null;
}

export function getModelPriceRange(
  brand: string,
  model: string,
): { new: { min: number; max: number }; used: { min: number; max: number } } | null {
  const normalizedBrand = normalizeBrand(brand);
  const lower = model.toLowerCase().trim();

  for (const ref of MODELS_CATALOG) {
    if (ref.brand.toLowerCase() !== normalizedBrand.toLowerCase()) continue;

    const matches =
      ref.canonicalModel.toLowerCase() === lower ||
      ref.aliases.some(
        (a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === lower.replace(/[^a-z0-9]/g, ""),
      );

    if (matches) {
      return {
        new: { ...ref.priceRangeNew },
        used: { ...ref.priceRangeUsed },
      };
    }
  }

  return null;
}

export function fuzzyMatchModel(input: string, candidates: string[]): string | null {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!normalized) return null;

  for (const c of candidates) {
    if (c.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized) {
      return c;
    }
  }

  for (const c of candidates) {
    const normC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normC.includes(normalized) || normalized.includes(normC)) {
      return c;
    }
  }

  let bestScore = 0;
  let bestCandidate: string | null = null;

  for (const c of candidates) {
    const score = levenshtein(normalized, c.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const maxLen = Math.max(normalized.length, c.length);
    const similarity = maxLen === 0 ? 1 : 1 - score / maxLen;

    if (similarity > bestScore && similarity > 0.6) {
      bestScore = similarity;
      bestCandidate = c;
    }
  }

  return bestCandidate;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }

  return dp[m]![n]!;
}

export function getAllModels(): ModelReference[] {
  return [...MODELS_CATALOG];
}

export function getModelsByBrand(brand: string): ModelReference[] {
  const normalizedBrand = normalizeBrand(brand);
  return MODELS_CATALOG.filter(
    (r) => r.brand.toLowerCase() === normalizedBrand.toLowerCase(),
  );
}

export function getDefaultFuel(brand: string, model: string): string | null {
  const normalizedBrand = normalizeBrand(brand);
  const lower = model.toLowerCase().trim();

  for (const ref of MODELS_CATALOG) {
    if (ref.brand.toLowerCase() !== normalizedBrand.toLowerCase()) continue;
    if (
      ref.canonicalModel.toLowerCase() === lower ||
      ref.aliases.some(
        (a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === lower.replace(/[^a-z0-9]/g, ""),
      )
    ) {
      return ref.fuelDefault;
    }
  }

  return null;
}

export function getDefaultTransmission(brand: string, model: string): string | null {
  const normalizedBrand = normalizeBrand(brand);
  const lower = model.toLowerCase().trim();

  for (const ref of MODELS_CATALOG) {
    if (ref.brand.toLowerCase() !== normalizedBrand.toLowerCase()) continue;
    if (
      ref.canonicalModel.toLowerCase() === lower ||
      ref.aliases.some(
        (a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === lower.replace(/[^a-z0-9]/g, ""),
      )
    ) {
      return ref.transmissionDefault;
    }
  }

  return null;
}
