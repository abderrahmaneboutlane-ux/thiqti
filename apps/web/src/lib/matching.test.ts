import { describe, it, expect } from "vitest";
import { rankVehicles, MatchExplanation } from "./matching";
import { SearchCriteria } from "./nlp";

function makeCar(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || "1",
    title: overrides.title || "Toyota RAV4 2023",
    make: overrides.make || "Toyota",
    model: overrides.model || "RAV4",
    year: overrides.year || 2023,
    price: overrides.price || 320000,
    priceFormatted: overrides.priceFormatted || "320 000 DH",
    km: overrides.km || 15000,
    fuel: overrides.fuel || "Hybride",
    city: overrides.city || "Casablanca",
    image: overrides.image || "",
    source: overrides.source || "auto24",
    url: overrides.url || "",
    score: overrides.score || 85,
    transmission: overrides.transmission || "Automatique",
    bodyType: overrides.bodyType || "SUV",
    inventoryType: overrides.inventoryType || "used",
  };
}

function makeCriteria(overrides: Partial<SearchCriteria> = {}): SearchCriteria {
  return {
    carrosserie: null,
    motorisation: null,
    transmission: null,
    marque: null,
    modele: null,
    budgetMin: null,
    budgetMax: null,
    budgetTolerance: 0.15,
    ville: null,
    anneeMin: null,
    anneeMax: null,
    kmMax: null,
    intent: [],
    ...overrides,
  };
}

describe("rankVehicles - Classement TOPSIS", () => {
  it("retourne un tableau trié par score décroissant", () => {
    const cars = [
      makeCar({ id: "1", price: 200000, year: 2020, km: 50000 }),
      makeCar({ id: "2", price: 350000, year: 2024, km: 5000 }),
      makeCar({ id: "3", price: 280000, year: 2022, km: 25000 }),
    ];
    const criteria = makeCriteria();
    const result = rankVehicles(cars, criteria);
    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].matchScore).toBeGreaterThanOrEqual(result[i].matchScore);
    }
  });

  it("priorise le budget moins cher si intent économique", () => {
    const cars = [
      makeCar({ id: "1", price: 180000, year: 2020, km: 40000, fuel: "Diesel" }),
      makeCar({ id: "2", price: 350000, year: 2024, km: 5000, fuel: "Diesel" }),
    ];
    const criteria = makeCriteria({ intent: ["economique"] });
    const result = rankVehicles(cars, criteria);
    expect(result[0].id).toBe("1");
  });

  it("priorise le kilométrage bas si intent familial", () => {
    const cars = [
      makeCar({ id: "1", price: 300000, year: 2022, km: 50000, fuel: "Diesel" }),
      makeCar({ id: "2", price: 310000, year: 2022, km: 10000, fuel: "Diesel" }),
    ];
    const criteria = makeCriteria({ intent: ["familial"] });
    const result = rankVehicles(cars, criteria);
    expect(result[0].id).toBe("2");
  });

  it("filtre par type de carrosserie", () => {
    const cars = [
      makeCar({ id: "1", title: "Toyota RAV4 SUV", bodyType: "SUV", price: 300000, year: 2023, km: 10000, fuel: "Hybride" }),
      makeCar({ id: "2", title: "Peugeot 208 Citadine", bodyType: "Citadine", price: 180000, year: 2023, km: 5000, fuel: "Essence" }),
    ];
    const criteria = makeCriteria({ carrosserie: "SUV" });
    const result = rankVehicles(cars, criteria);
    expect(result[0].id).toBe("1");
  });

  it("filtre par motorisation", () => {
    const cars = [
      makeCar({ id: "1", fuel: "Diesel", price: 250000, year: 2023, km: 10000 }),
      makeCar({ id: "2", fuel: "Essence", price: 250000, year: 2023, km: 10000 }),
    ];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    expect(result[0].id).toBe("1");
  });

  it("gère un seul véhicule", () => {
    const cars = [makeCar({ id: "1" })];
    const criteria = makeCriteria();
    const result = rankVehicles(cars, criteria);
    expect(result.length).toBe(1);
  });

  it("gère un tableau vide", () => {
    const criteria = makeCriteria();
    const result = rankVehicles([], criteria);
    expect(result.length).toBe(0);
  });
});

describe("rankVehicles - Explicabilité", () => {
  it("chaque résultat a des explications", () => {
    const cars = [
      makeCar({ id: "1", price: 300000, year: 2023, km: 10000, fuel: "Diesel" }),
      makeCar({ id: "2", price: 250000, year: 2022, km: 20000, fuel: "Essence" }),
    ];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    result.forEach((car) => {
      expect(car.explanations).toBeDefined();
      expect(car.explanations.length).toBeGreaterThan(0);
    });
  });

  it("les explications ont le bon format", () => {
    const cars = [makeCar({ id: "1", price: 300000, year: 2023, km: 10000, fuel: "Diesel" })];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    result.forEach((car) => {
      car.explanations.forEach((exp) => {
        expect(exp).toHaveProperty("label");
        expect(exp).toHaveProperty("value");
        expect(exp).toHaveProperty("impact");
        expect(exp).toHaveProperty("reason");
        expect(["positive", "negative", "neutral"]).toContain(exp.impact);
      });
    });
  });

  it("marque l'impact positif pour un critère correspondant", () => {
    const cars = [makeCar({ id: "1", fuel: "Diesel" })];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    const fuelExplanation = result[0].explanations.find((e) => e.label === "Motorisation");
    expect(fuelExplanation).toBeDefined();
    expect(fuelExplanation!.impact).toBe("positive");
  });

  it("marque l'impact négatif pour un critère non correspondant", () => {
    const cars = [makeCar({ id: "1", fuel: "Essence" })];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    const fuelExplanation = result[0].explanations.find((e) => e.label === "Motorisation");
    expect(fuelExplanation).toBeDefined();
    expect(fuelExplanation!.impact).toBe("negative");
  });
});

describe("rankVehicles - meetBudget/meetsBody/meetsFuel", () => {
  it("meetsBudget est true si dans la plage", () => {
    const cars = [makeCar({ id: "1", price: 300000 })];
    const criteria = makeCriteria({ budgetMin: 250000, budgetMax: 350000 });
    const result = rankVehicles(cars, criteria);
    expect(result[0].meetsBudget).toBe(true);
  });

  it("meetsBudget est false si hors plage avec tolérance", () => {
    const cars = [makeCar({ id: "1", price: 500000 })];
    const criteria = makeCriteria({ budgetMin: 250000, budgetMax: 350000, budgetTolerance: 0.1 });
    const result = rankVehicles(cars, criteria);
    expect(result[0].meetsBudget).toBe(false);
  });

  it("meetsBody est true si le titre contient la carrosserie", () => {
    const cars = [makeCar({ id: "1", title: "Toyota RAV4 SUV" })];
    const criteria = makeCriteria({ carrosserie: "SUV" });
    const result = rankVehicles(cars, criteria);
    expect(result[0].meetsBody).toBe(true);
  });

  it("meetsFuel est true si le carburant correspond", () => {
    const cars = [makeCar({ id: "1", fuel: "Diesel" })];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    expect(result[0].meetsFuel).toBe(true);
  });

  it("meetsFuel est false si le carburant diffère", () => {
    const cars = [makeCar({ id: "1", fuel: "Essence" })];
    const criteria = makeCriteria({ motorisation: "Diesel" });
    const result = rankVehicles(cars, criteria);
    expect(result[0].meetsFuel).toBe(false);
  });
});

describe("rankVehicles - matchPercent", () => {
  it("matchPercent est entre 0 et 100", () => {
    const cars = [
      makeCar({ id: "1", price: 200000, year: 2020, km: 30000 }),
      makeCar({ id: "2", price: 350000, year: 2024, km: 5000 }),
    ];
    const criteria = makeCriteria();
    const result = rankVehicles(cars, criteria);
    result.forEach((car) => {
      expect(car.matchPercent).toBeGreaterThanOrEqual(0);
      expect(car.matchPercent).toBeLessThanOrEqual(100);
    });
  });
});

describe("rankVehicles - Robustesse (analyse de sensibilité)", () => {
  it("un léger changement de prix ne change pas drastiquement le classement", () => {
    const cars = [
      makeCar({ id: "1", price: 300000, year: 2023, km: 10000, fuel: "Diesel" }),
      makeCar({ id: "2", price: 310000, year: 2023, km: 10000, fuel: "Diesel" }),
      makeCar({ id: "3", price: 320000, year: 2023, km: 10000, fuel: "Diesel" }),
    ];
    const criteria = makeCriteria();
    const result1 = rankVehicles(cars, criteria);

    const cars2 = [
      makeCar({ id: "1", price: 305000, year: 2023, km: 10000, fuel: "Diesel" }),
      makeCar({ id: "2", price: 310000, year: 2023, km: 10000, fuel: "Diesel" }),
      makeCar({ id: "3", price: 315000, year: 2023, km: 10000, fuel: "Diesel" }),
    ];
    const result2 = rankVehicles(cars2, criteria);

    expect(result1[0].id).toBe(result2[0].id);
  });
});
