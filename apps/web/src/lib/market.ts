export interface MarketStats {
  make: string;
  model: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  avgKm: number;
  avgYear: number;
  priceByYear: Record<number, number>;
  bestDeal: { title: string; price: number; savings: number } | null;
}

export interface FuelEstimate {
  monthlyKm: number;
  fuelType: string;
  fuelPricePerLiter: number;
  consumptionPer100km: number;
  monthlyCost: number;
  yearlyCost: number;
  co2PerYear: number;
}

const FUEL_PRICES: Record<string, number> = {
  "Diesel": 10.72,
  "Essence": 12.96,
  "Hybride": 11.50,
  "Électrique": 2.50,
  "Hybride rechargeable": 11.00,
};

const CONSUMPTION: Record<string, number> = {
  "Diesel": 5.5,
  "Essence": 7.0,
  "Hybride": 4.5,
  "Électrique": 1.8,
  "Hybride rechargeable": 5.0,
};

const CO2_FACTORS: Record<string, number> = {
  "Diesel": 2.65,
  "Essence": 2.31,
  "Hybride": 1.50,
  "Électrique": 0.05,
  "Hybride rechargeable": 1.20,
};

export function computeMarketStats(
  cars: { make: string; model: string; price: number; km: number; year: number; title: string }[],
  targetMake: string,
  targetModel: string,
): MarketStats | null {
  const filtered = cars.filter(
    (c) => c.make.toLowerCase() === targetMake.toLowerCase() &&
           c.model.toLowerCase().includes(targetModel.toLowerCase()) &&
           c.price > 0
  );
  if (filtered.length === 0) return null;

  const prices = filtered.map((c) => c.price);
  const kms = filtered.map((c) => c.km);
  const years = filtered.map((c) => c.year);

  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgKm = Math.round(kms.reduce((a, b) => a + b, 0) / kms.length);
  const avgYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);

  const priceByYear: Record<number, number> = {};
  for (const c of filtered) {
    if (!priceByYear[c.year]) priceByYear[c.year] = 0;
    priceByYear[c.year] += c.price;
  }
  for (const y of Object.keys(priceByYear)) {
    priceByYear[Number(y)] = Math.round(priceByYear[Number(y)] / filtered.filter((c) => c.year === Number(y)).length);
  }

  const bestCar = filtered.reduce((best, c) => {
    const score = (c.year * 10) + (100000 - c.km) * 0.01 - c.price * 0.0001;
    const bestScore = (best.year * 10) + (100000 - best.km) * 0.001 - best.price * 0.0001;
    return score > bestScore ? c : best;
  }, filtered[0]);

  const savings = avgPrice - bestCar.price;

  return {
    make: targetMake,
    model: targetModel,
    count: filtered.length,
    avgPrice,
    minPrice,
    maxPrice,
    avgKm,
    avgYear,
    priceByYear,
    bestDeal: savings > 0 ? { title: bestCar.title, price: bestCar.price, savings } : null,
  };
}

export function estimateFuelCost(
  fuelType: string,
  monthlyKm: number = 1000,
): FuelEstimate {
  const pricePerLiter = FUEL_PRICES[fuelType] || FUEL_PRICES["Essence"];
  const consumption = CONSUMPTION[fuelType] || CONSUMPTION["Essence"];
  const co2Factor = CO2_FACTORS[fuelType] || CO2_FACTORS["Essence"];

  const monthlyLiters = (monthlyKm * consumption) / 100;
  const monthlyCost = Math.round(monthlyLiters * pricePerLiter);
  const yearlyCost = monthlyCost * 12;
  const co2PerYear = Math.round((monthlyKm * 12 * co2Factor) / 1000);

  return {
    monthlyKm,
    fuelType,
    fuelPricePerLiter: pricePerLiter,
    consumptionPer100km: consumption,
    monthlyCost,
    yearlyCost,
    co2PerYear,
  };
}

export function formatPriceDH(price: number): string {
  return price.toLocaleString("fr-FR") + " DH";
}
