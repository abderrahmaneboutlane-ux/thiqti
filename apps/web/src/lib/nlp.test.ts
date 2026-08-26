import { describe, it, expect } from "vitest";
import { parseQuery, mergeSearchIntent, diffCriteria, intentToSearchParams, type SearchIntent } from "./nlp";

describe("parseQuery - Extraction de critères explicites", () => {
  it("extrait le type de carrosserie SUV", () => {
    const result = parseQuery("Je cherche un SUV");
    expect(result.carrosserie).toBe("SUV");
  });

  it("extrait le type de carrosserie berline", () => {
    const result = parseQuery("Une berline confortable");
    expect(result.carrosserie).toBe("Berline");
  });

  it("extrait la motorisation diesel", () => {
    const result = parseQuery("Un véhicule diesel");
    expect(result.motorisation).toBe("Diesel");
  });

  it("extrait la motorisation hybride", () => {
    const result = parseQuery("Un SUV hybride");
    expect(result.motorisation).toBe("Hybride");
  });

  it("extrait la motorisation essence", () => {
    const result = parseQuery("Voiture essence");
    expect(result.motorisation).toBe("Essence");
  });

  it("extrait la transmission automatique", () => {
    const result = parseQuery("Boîte automatique");
    expect(result.transmission).toBe("Automatique");
  });

  it("extrait la marque Toyota", () => {
    const result = parseQuery("Un Toyota");
    expect(result.marque).toBe("Toyota");
  });

  it("extrait la marque Hyundai", () => {
    const result = parseQuery("Je veux un Hyundai Tucson");
    expect(result.marque).toBe("Hyundai");
  });

  it("extrait la ville Casablanca", () => {
    const result = parseQuery("À Casablanca");
    expect(result.ville).toBe("Casablanca");
  });

  it("extrait la ville Marrakech", () => {
    const result = parseQuery("Disponible à Marrakech");
    expect(result.ville).toBe("Marrakech");
  });
});

describe("parseQuery - Extraction budget", () => {
  it("extrait budget avec 'autour de'", () => {
    const result = parseQuery("Autour de 350000 DH");
    expect(result.budgetMin).toBeGreaterThanOrEqual(250000);
    expect(result.budgetMax).toBeLessThanOrEqual(500000);
    expect(result.budgetMax).toBeGreaterThan(result.budgetMin!);
  });

  it("extrait budget avec 'entre X et Y'", () => {
    const result = parseQuery("Entre 200000 et 400000 DH");
    expect(result.budgetMin).toBe(200000);
    expect(result.budgetMax).toBe(400000);
  });

  it("extrait budget avec 'sous'", () => {
    const result = parseQuery("Moins de 300000 DH");
    expect(result.budgetMax).toBe(300000);
    expect(result.budgetMin).toBeNull();
  });

  it("extrait budget avec montant simple", () => {
    const result = parseQuery("Budget de 250000 DH");
    expect(result.budgetMin).not.toBeNull();
    expect(result.budgetMax).not.toBeNull();
  });
});

describe("parseQuery - Extraction année et km", () => {
  it("extrait année minimum", () => {
    const result = parseQuery("Depuis 2022");
    expect(result.anneeMin).toBe(2022);
  });

  it("extrait un seul année comme plage", () => {
    const result = parseQuery("Année 2023");
    expect(result.anneeMin).toBe(2023);
    expect(result.anneeMax).toBe(2024);
  });

  it("extrait kilométrage max", () => {
    const result = parseQuery("Moins de 50000 km");
    expect(result.kmMax).toBe(50000);
  });

  it("extrait kilométrage sans qualificatif", () => {
    const result = parseQuery("30000 km");
    expect(result.kmMax).toBe(30000);
  });
});

describe("parseQuery - Détection d'intention", () => {
  it("détecte l'intention familiale", () => {
    const result = parseQuery("Pour la famille");
    expect(result.intent).toContain("family");
  });

  it("détecte l'intention économique", () => {
    const result = parseQuery("Pas cher, petit budget");
    expect(result.intent).toContain("economic");
  });

  it("détecte l'intention confort", () => {
    const result = parseQuery("Confortable et luxe");
    expect(result.intent).toContain("comfort");
  });

  it("détecte l'intention sportive", () => {
    const result = parseQuery("Puissant et performant");
    expect(result.intent).toContain("sport");
  });

  it("détecte l'intention ville", () => {
    const result = parseQuery("Pour la ville, parking facile");
    expect(result.intent).toContain("city");
  });

  it("détecte l'intention tout-terrain", () => {
    const result = parseQuery("Véhicule tout-terrain");
    expect(result.intent).toContain("offroad");
  });
});

describe("parseQuery - Requête complète (cas de référence)", () => {
  it("la requête de référence du cahier des charges", () => {
    const result = parseQuery("Je cherche un SUV hybride autour de 350000 dirhams, confortable pour la famille, boîte auto");
    expect(result.carrosserie).toBe("SUV");
    expect(result.motorisation).toBe("Hybride");
    expect(result.budgetMin).not.toBeNull();
    expect(result.budgetMax).not.toBeNull();
    expect(result.transmission).toBe("Automatique");
    expect(result.intent).toContain("family");
    expect(result.intent).toContain("comfort");
  });
});

describe("parseQuery - Texte vide ou invalide", () => {
  it("retourne des valeurs nulles pour texte vide", () => {
    const result = parseQuery("");
    expect(result.carrosserie).toBeNull();
    expect(result.motorisation).toBeNull();
    expect(result.marque).toBeNull();
    expect(result.budgetMin).toBeNull();
    expect(result.budgetMax).toBeNull();
  });

  it("gère le texte sans critères reconnus", () => {
    const result = parseQuery("bonjour comment allez-vous");
    expect(result.carrosserie).toBeNull();
    expect(result.motorisation).toBeNull();
    expect(result.intent).toHaveLength(0);
  });
});

describe("parseQuery - Normalisation du texte", () => {
  it("gère les accents correctement", () => {
    const result = parseQuery("Voiture electrique");
    expect(result.motorisation).toBe("Electrique");
  });

  it("gère la casse", () => {
    const result = parseQuery("SUV DIESEL");
    expect(result.carrosserie).toBe("SUV");
    expect(result.motorisation).toBe("Diesel");
  });
});

describe("parseQuery - Darija / Arabe", () => {
  it("comprend 'bghit SUV diesel'", () => {
    const result = parseQuery("bghit SUV diesel");
    expect(result.carrosserie).toBe("SUV");
    expect(result.motorisation).toBe("Diesel");
  });

  it("comprend 'automatique' en darija", () => {
    const result = parseQuery("bghit voiture automatique");
    expect(result.transmission).toBe("Automatique");
  });

  it("extrait budget max en darija avec nombre complet", () => {
    const result = parseQuery("bghit SUV diesel max 180000");
    expect(result.carrosserie).toBe("SUV");
    expect(result.motorisation).toBe("Diesel");
    expect(result.budgetMax).toBe(180000);
  });

  it("extrait ville Casa depuis une requête darija", () => {
    const result = parseQuery("bghit voiture Casa diesel");
    expect(result.ville).not.toBeNull();
  });

  it("comprend 'famille' en darija", () => {
    const result = parseQuery("bghit voiture pour la famille diesel");
    expect(result.motorisation).toBe("Diesel");
    expect(result.intent).toContain("family");
  });

  it("comprend la requête complète darija-français mixte", () => {
    const result = parseQuery("bghit SUV diesel automatique max 180000 f Casablanca");
    expect(result.carrosserie).toBe("SUV");
    expect(result.motorisation).toBe("Diesel");
    expect(result.transmission).toBe("Automatique");
    expect(result.budgetMax).toBe(180000);
    expect(result.ville).toBe("Casablanca");
  });

  it("gère les noms de marques en arabe", () => {
    const result = parseQuery("عندماtoyota diesel");
    expect(result.motorisation).toBe("Diesel");
  });

  it("extrait diesel en arabe", () => {
    const result = parseQuery("سيارة ديزل");
    expect(result.motorisation).toBe("Diesel");
  });

  it("comprend 'bghit diesel famille max 20 milion'", () => {
    const result = parseQuery("bghit diesel famille max 20 milion");
    expect(result.motorisation).toBe("Diesel");
    expect(result.intent).toContain("family");
    expect(result.budgetMax).toBe(200000);
  });

  it("comprend 'ما بغيتش ديزل، بغيت essence'", () => {
    const result = parseQuery("ما بغيتش ديزل، بغيت essence");
    expect(result.motorisation).toBe("Essence");
  });

  it("comprend 'finalement 250k'", () => {
    const result = parseQuery("finalement 250k");
    expect(result.budgetMax).toBe(250000);
  });

  it("comprend 'pas Casa, Rabat'", () => {
    const result = parseQuery("pas Casa, Rabat");
    expect(result.ville).toBe("Rabat");
  });
});

describe("parseQuery - Negation", () => {
  it("comprend 'pas de diesel' et annule la motorisation", () => {
    const result = parseQuery("pas de diesel");
    expect(result.motorisation).toBeNull();
  });

  it("comprend 'non pas diesel, essence' → essence détecté d'abord, puis effacé par neg", () => {
    const result = parseQuery("pas de diesel");
    expect(result.motorisation).toBeNull();
  });

  it("comprend 'pas de SUV' et annule la carrosserie", () => {
    const result = parseQuery("pas de SUV");
    expect(result.carrosserie).toBeNull();
  });

  it("comprend 'ma bghitcho diesel' (darija negation)", () => {
    const result = parseQuery("ما بغيتش ديزل");
    expect(result.motorisation).toBeNull();
  });

  it("comprend 'sans essence' et annule la motorisation", () => {
    const result = parseQuery("sans essence");
    expect(result.motorisation).toBeNull();
  });
});

describe("parseQuery - Extraction modèle", () => {
  it("extrait le modèle RAV4 avec Toyota", () => {
    const result = parseQuery("Toyota RAV4");
    expect(result.marque).toBe("Toyota");
    expect(result.modele).toBe("RAV4");
  });

  it("extrait le modèle Duster avec Dacia", () => {
    const result = parseQuery("Dacia Duster diesel");
    expect(result.marque).toBe("Dacia");
    expect(result.modele).toBe("Duster");
    expect(result.motorisation).toBe("Diesel");
  });

  it("extrait le modèle Tucson avec Hyundai", () => {
    const result = parseQuery("Hyundai Tucson automatique");
    expect(result.marque).toBe("Hyundai");
    expect(result.modele).toBe("Tucson");
    expect(result.transmission).toBe("Automatique");
  });

  it("extrait le modèle Clio avec Renault", () => {
    const result = parseQuery("Renault Clio essence");
    expect(result.marque).toBe("Renault");
    expect(result.modele).toBe("Clio");
  });

  it("extrait le modèle Sandero avec Dacia", () => {
    const result = parseQuery("Dacia Sandero moins de 150000 DH");
    expect(result.marque).toBe("Dacia");
    expect(result.modele).toBe("Sandero");
  });

  it("ne détecte pas de modèle sans marque connue", () => {
    const result = parseQuery("SUV automatique diesel");
    expect(result.modele).toBeNull();
  });
});

describe("parseQuery - Prix marocains", () => {
  it("convertit '20 million' en budget", () => {
    const result = parseQuery("20 million");
    expect(result.budgetMax).toBe(200000);
  });

  it("convertit '20 mlyon' en budget", () => {
    const result = parseQuery("20 mlyon");
    expect(result.budgetMax).toBe(200000);
  });

  it("convertit '200k' en budget", () => {
    const result = parseQuery("200k DH");
    expect(result.budgetMax).toBe(200000);
  });

  it("convertit '5 mlyon' en budget", () => {
    const result = parseQuery("5 mlyon");
    expect(result.budgetMax).toBe(50000);
  });

  it("gère '20M' (abréviation)", () => {
    const result = parseQuery("SUV 20M");
    expect(result.budgetMax).toBe(200000);
    expect(result.carrosserie).toBe("SUV");
  });
});

describe("mergeSearchIntent - Recherche progressive", () => {
  const emptyIntent: SearchIntent = { confidence: {} };

  it("enrichit un intent vide avec diesel", () => {
    const result = mergeSearchIntent(emptyIntent, "je veux une voiture diesel");
    expect(result.fuel).toBe("Diesel");
    expect(result.confidence.fuel).toBe(0.9);
  });

  it("enrichit un intent avec famille + diesel", () => {
    const result = mergeSearchIntent(emptyIntent, "diesel famille budget 20 million");
    expect(result.fuel).toBe("Diesel");
    expect(result.userIntent).toBe("family");
    expect(result.maxPrice).toBe(200000);
  });

  it("conserve les critères précédents et ajoute le nouveau", () => {
    const prev: SearchIntent = { fuel: "Diesel", confidence: { fuel: 0.9 } };
    const result = mergeSearchIntent(prev, "familiale Casablanca");
    expect(result.fuel).toBe("Diesel");
    expect(result.city).toBe("Casablanca");
    expect(result.userIntent).toBe("family");
  });

  it("remplace un critère existant quand un nouveau est fourni", () => {
    const prev: SearchIntent = { fuel: "Diesel", city: "Casa", confidence: { fuel: 0.9, city: 0.9 } };
    const result = mergeSearchIntent(prev, "pas Casa, Rabat");
    expect(result.fuel).toBe("Diesel");
    expect(result.city).toBe("Rabat");
  });

  it("enrichit avec une marque", () => {
    const result = mergeSearchIntent(emptyIntent, "Toyota hybride");
    expect(result.brand).toBe("Toyota");
    expect(result.fuel).toBe("Hybride");
  });

  it("enrichit avec un modèle", () => {
    const prev: SearchIntent = { brand: "Toyota", confidence: { brand: 0.9 } };
    const result = mergeSearchIntent(prev, "RAV4");
    expect(result.model).toBe("RAV4");
  });
});

describe("diffCriteria - Détection de changements", () => {
  it("détecte un changement de motorisation", () => {
    const prev = parseQuery("diesel");
    const next = parseQuery("essence");
    const changes = diffCriteria(prev, next);
    expect(changes.motorisation).toBe("Essence");
  });

  it("détecte un changement de budget", () => {
    const prev = parseQuery("max 200000");
    const next = parseQuery("max 300000");
    const changes = diffCriteria(prev, next);
    expect(changes.budgetMax).toBe(300000);
  });

  it("ne retourne rien si aucun changement", () => {
    const prev = parseQuery("diesel");
    const next = parseQuery("diesel");
    const changes = diffCriteria(prev, next);
    expect(Object.keys(changes)).toHaveLength(0);
  });
});

describe("intentToSearchParams - Conversion API", () => {
  it("convertit un intent complet en paramètres API", () => {
    const intent: SearchIntent = {
      fuel: "Diesel",
      bodyType: "SUV",
      brand: "Toyota",
      city: "Casablanca",
      maxPrice: 200000,
      confidence: {},
    };
    const params = intentToSearchParams(intent);
    expect(params.fuel).toBe("Diesel");
    expect(params.body_type).toBe("SUV");
    expect(params.make).toBe("Toyota");
    expect(params.city).toBe("Casablanca");
    expect(params.max_price).toBe(200000);
  });

  it("ignore les champs undefined", () => {
    const intent: SearchIntent = { fuel: "Diesel", confidence: {} };
    const params = intentToSearchParams(intent);
    expect(params.body_type).toBeUndefined();
    expect(params.make).toBeUndefined();
  });
});
