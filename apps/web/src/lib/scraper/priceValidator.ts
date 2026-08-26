import { getModelPriceRange } from "./models";

export interface PriceValidation {
  valid: boolean;
  confidence: "high" | "medium" | "low";
  reason?: string;
  suggestedPrice?: number;
}

const CURRENT_YEAR = new Date().getFullYear();

const ABSOLUTE_MIN_DH = 5_000;
const ABSOLUTE_MAX_DH = 5_000_000;

const NEW_CAR_MSRP: Record<string, Record<string, { min: number; max: number }>> = {
  Dacia: {
    Logan: { min: 149_900, max: 210_000 },
    Sandero: { min: 149_900, max: 210_000 },
    Duster: { min: 199_900, max: 320_000 },
    Spring: { min: 199_900, max: 260_000 },
  },
  Renault: {
    Clio: { min: 179_900, max: 280_000 },
    Captur: { min: 219_900, max: 330_000 },
    Megane: { min: 229_900, max: 350_000 },
    Duster: { min: 209_900, max: 330_000 },
    Sandero: { min: 169_900, max: 240_000 },
    Kangoo: { min: 199_900, max: 290_000 },
    Austral: { min: 319_900, max: 420_000 },
  },
  Peugeot: {
    "208": { min: 189_900, max: 280_000 },
    "2008": { min: 219_900, max: 330_000 },
    "308": { min: 249_900, max: 380_000 },
    "3008": { min: 299_900, max: 450_000 },
    "5008": { min: 349_900, max: 500_000 },
    Partner: { min: 199_900, max: 290_000 },
  },
  Volkswagen: {
    Polo: { min: 219_900, max: 310_000 },
    Golf: { min: 289_900, max: 420_000 },
    "T-Cross": { min: 249_900, max: 340_000 },
    "T-Roc": { min: 299_900, max: 420_000 },
    Tiguan: { min: 369_900, max: 520_000 },
  },
  Hyundai: {
    i10: { min: 149_900, max: 200_000 },
    i20: { min: 179_900, max: 260_000 },
    i30: { min: 229_900, max: 330_000 },
    Tucson: { min: 349_900, max: 500_000 },
    Kona: { min: 269_900, max: 380_000 },
    Bayon: { min: 199_900, max: 280_000 },
  },
  Kia: {
    Picanto: { min: 139_900, max: 190_000 },
    Stonic: { min: 219_900, max: 310_000 },
    Sportage: { min: 329_900, max: 480_000 },
    Niro: { min: 299_900, max: 420_000 },
    XCeed: { min: 249_900, max: 350_000 },
  },
  Toyota: {
    Yaris: { min: 189_900, max: 260_000 },
    Corolla: { min: 249_900, max: 360_000 },
    "C-HR": { min: 279_900, max: 400_000 },
    RAV4: { min: 369_900, max: 520_000 },
    Aygo: { min: 139_900, max: 190_000 },
  },
  "Citroën": {
    C3: { min: 169_900, max: 240_000 },
    C4: { min: 229_900, max: 340_000 },
    C5: { min: 319_900, max: 460_000 },
    "C5 Aircross": { min: 319_900, max: 460_000 },
    Berlingo: { min: 199_900, max: 290_000 },
  },
  Ford: {
    Fiesta: { min: 189_900, max: 270_000 },
    Focus: { min: 249_900, max: 360_000 },
    Puma: { min: 249_900, max: 350_000 },
    Kuga: { min: 319_900, max: 450_000 },
  },
  Nissan: {
    Micra: { min: 179_900, max: 250_000 },
    Juke: { min: 239_900, max: 340_000 },
    Qashqai: { min: 319_900, max: 460_000 },
    XTrail: { min: 369_900, max: 520_000 },
  },
  Seat: {
    Ibiza: { min: 189_900, max: 270_000 },
    Arona: { min: 219_900, max: 310_000 },
    Leon: { min: 249_900, max: 360_000 },
    Ateca: { min: 309_900, max: 440_000 },
  },
  Fiat: {
    "500": { min: 169_900, max: 260_000 },
    Panda: { min: 139_900, max: 190_000 },
    Tipo: { min: 189_900, max: 270_000 },
  },
  Opel: {
    Corsa: { min: 189_900, max: 270_000 },
    Mokka: { min: 249_900, max: 350_000 },
    Crossland: { min: 219_900, max: 310_000 },
  },
  "Škoda": {
    Fabia: { min: 189_900, max: 260_000 },
    Kamiq: { min: 229_900, max: 320_000 },
    Octavia: { min: 269_900, max: 390_000 },
  },
  Suzuki: {
    Swift: { min: 159_900, max: 220_000 },
    Vitara: { min: 229_900, max: 330_000 },
    Jimny: { min: 199_900, max: 260_000 },
  },
  Mazda: {
    "Mazda2": { min: 189_900, max: 260_000 },
    "Mazda3": { min: 259_900, max: 380_000 },
    "CX-30": { min: 279_900, max: 390_000 },
    "CX-5": { min: 349_900, max: 490_000 },
  },
  Mitsubishi: {
    ASX: { min: 249_900, max: 350_000 },
    Outlander: { min: 399_900, max: 560_000 },
  },
  Changan: {
    CS35: { min: 169_900, max: 230_000 },
    CS55: { min: 209_900, max: 290_000 },
    CS75: { min: 249_900, max: 340_000 },
    Alsvin: { min: 139_900, max: 190_000 },
  },
  MG: {
    MG3: { min: 149_900, max: 200_000 },
    ZS: { min: 199_900, max: 290_000 },
    HS: { min: 269_900, max: 380_000 },
  },
  BYD: {
    Dolphin: { min: 249_900, max: 340_000 },
    Atto3: { min: 329_900, max: 430_000 },
    Seal: { min: 429_900, max: 580_000 },
  },
  DFSK: {
    Glory500: { min: 189_900, max: 260_000 },
    Glory580: { min: 219_900, max: 310_000 },
  },
};

const YEARLY_DEPRECIATION: Record<string, number> = {
  Dacia: 0.12,
  Renault: 0.13,
  Peugeot: 0.13,
  Volkswagen: 0.11,
  Hyundai: 0.12,
  Kia: 0.12,
  Toyota: 0.10,
  "Citroën": 0.13,
  Ford: 0.14,
  Nissan: 0.13,
  Seat: 0.14,
  Fiat: 0.15,
  Opel: 0.14,
  "Škoda": 0.12,
  Suzuki: 0.11,
  Mazda: 0.11,
  Mitsubishi: 0.13,
  Changan: 0.18,
  MG: 0.17,
  BYD: 0.15,
  DFSK: 0.19,
};

function getDepreciation(brand: string): number {
  return YEARLY_DEPRECIATION[brand] ?? 0.13;
}

function getMsrp(brand: string, model: string): { min: number; max: number } | null {
  const brandModels = NEW_CAR_MSRP[brand];
  if (!brandModels) return null;

  for (const [key, range] of Object.entries(brandModels)) {
    if (key.toLowerCase() === model.toLowerCase()) {
      return range;
    }
  }

  const normalized = model.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, range] of Object.entries(brandModels)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      return range;
    }
  }

  return null;
}

export function validatePrice(
  price: number,
  make: string,
  model: string,
  year: number,
): PriceValidation {
  if (price <= 0) {
    return { valid: false, confidence: "high", reason: "Prix nul ou négatif" };
  }

  if (price < ABSOLUTE_MIN_DH) {
    return {
      valid: false,
      confidence: "high",
      reason: `Prix trop bas (< ${ABSOLUTE_MIN_DH.toLocaleString("fr-FR")} DH)`,
      suggestedPrice: ABSOLUTE_MIN_DH,
    };
  }

  if (price > ABSOLUTE_MAX_DH) {
    return {
      valid: false,
      confidence: "high",
      reason: `Prix trop élevé (> ${ABSOLUTE_MAX_DH.toLocaleString("fr-FR")} DH)`,
      suggestedPrice: ABSOLUTE_MAX_DH,
    };
  }

  const age = CURRENT_YEAR - year;
  const isNew = age <= 1 && price > 50_000;
  const msrp = getMsrp(make, model);

  if (isNew && msrp) {
    const msrpMid = (msrp.min + msrp.max) / 2;
    const deviation = Math.abs(price - msrpMid) / msrpMid;

    if (deviation > 0.20) {
      const suggested = price < msrp.min ? msrp.min : msrp.max;
      return {
        valid: false,
        confidence: "high",
        reason: `Prix neuf dévie de ±20% du tarif officiel (${msrpMid.toLocaleString("fr-FR")} DH)`,
        suggestedPrice: suggested,
      };
    }
    return {
      valid: true,
      confidence: "high",
      reason: "Prix cohérent avec le tarif officiel",
    };
  }

  const modelRange = getModelPriceRange(make, model);

  if (modelRange) {
    const usedRange = modelRange.used;
    const median = (usedRange.min + usedRange.max) / 2;

    if (price < usedRange.min * 0.05) {
      return {
        valid: false,
        confidence: "medium",
        reason: `Prix < 5% du prix médian du modèle (${median.toLocaleString("fr-FR")} DH)`,
        suggestedPrice: Math.round(usedRange.min * 0.3),
      };
    }

    if (price > usedRange.max * 5) {
      return {
        valid: false,
        confidence: "medium",
        reason: `Prix > 500% du prix médian du modèle (${median.toLocaleString("fr-FR")} DH)`,
        suggestedPrice: Math.round(usedRange.max * 0.8),
      };
    }

    if (age >= 2) {
      const expectedNew = msrp ? (msrp.min + msrp.max) / 2 : usedRange.max * 1.5;
      const expectedNow = expectedNew * Math.pow(1 - getDepreciation(make), age);
      const ratio = price / expectedNow;

      if (ratio < 0.5 || ratio > 1.5) {
        return {
          valid: true,
          confidence: "low",
          reason: `Prix ${ratio < 0.5 ? "très bas" : "très élevé"} par rapport à la dépréciation estimée`,
          suggestedPrice: Math.round(expectedNow),
        };
      }

      return {
        valid: true,
        confidence: "high",
        reason: "Prix cohérent avec la dépréciation du modèle",
      };
    }

    return {
      valid: true,
      confidence: "medium",
      reason: "Prix dans la fourchette du modèle",
    };
  }

  if (age >= 2) {
    const depreciation = getDepreciation(make);
    const estimatedMedian = price > 100_000 ? price / Math.pow(1 - depreciation, age) : 200_000;
    const expectedNow = estimatedMedian * Math.pow(1 - depreciation, age);
    const ratio = price / expectedNow;

    if (ratio < 0.3 || ratio > 3.0) {
      return {
        valid: true,
        confidence: "low",
        reason: `Prix ${ratio < 0.3 ? "très bas" : "très élevé"} sans référence modèle`,
        suggestedPrice: Math.round(expectedNow),
      };
    }
  }

  return {
    valid: true,
    confidence: "low",
    reason: "Pas de référence modèle disponible, prix accepté",
  };
}

export function batchValidate(
  cars: { id: string; make: string; model: string; year: number; price: number }[],
): { valid: string[]; invalid: { id: string; validation: PriceValidation }[] } {
  const valid: string[] = [];
  const invalid: { id: string; validation: PriceValidation }[] = [];

  for (const car of cars) {
    const v = validatePrice(car.price, car.make, car.model, car.year);
    if (v.valid) {
      valid.push(car.id);
    } else {
      invalid.push({ id: car.id, validation: v });
    }
  }

  return { valid, invalid };
}
