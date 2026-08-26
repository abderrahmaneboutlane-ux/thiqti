import { describe, it, expect } from "vitest";
import { analyzeSentiment, analyzeAspectSentiment } from "./sentiment";

describe("analyzeSentiment - Textes positifs", () => {
  it("détecte un sentiment positif simple", () => {
    const result = analyzeSentiment("Excellent véhicule, je recommande");
    expect(result.sentiment).toBe("positive");
    expect(result.score).toBeGreaterThan(0);
  });

  it("détecte un sentiment très positif", () => {
    const result = analyzeSentiment("Superbe voiture, parfait pour la famille, vraiment confortable");
    expect(result.sentiment).toBe("positive");
    expect(result.score).toBeGreaterThan(0.3);
  });

  it("détecte le positif avec émoticônes", () => {
    const result = analyzeSentiment("Bonne voiture :)");
    expect(result.sentiment).toBe("positive");
  });
});

describe("analyzeSentiment - Textes négatifs", () => {
  it("détecte un sentiment négatif simple", () => {
    const result = analyzeSentiment("Mauvais véhicule, problème de moteur");
    expect(result.sentiment).toBe("negative");
    expect(result.score).toBeLessThan(0);
  });

  it("détecte un sentiment très négatif", () => {
    const result = analyzeSentiment("Horrible, décevant, problème après problème, arnaque totale");
    expect(result.sentiment).toBe("negative");
    expect(result.score).toBeLessThan(-0.3);
  });
});

describe("analyzeSentiment - Textes neutres", () => {
  it("détecte un sentiment neutre", () => {
    const result = analyzeSentiment("Le véhicule est correct, rien de spécial");
    expect(result.sentiment).toBe("neutral");
  });

  it("gère le texte vide", () => {
    const result = analyzeSentiment("");
    expect(result.sentiment).toBe("neutral");
    expect(result.score).toBe(0);
    expect(result.confidence).toBe(0);
  });

  it("gère le texte sans mots de sentiment", () => {
    const result = analyzeSentiment("Le vehicule a 4 portes et 5 places");
    expect(result.sentiment).toBe("neutral");
  });
});

describe("analyzeSentiment - Darija/Arabe", () => {
  it("détecte le positif en darija", () => {
    const result = analyzeSentiment("mzyan bzzf");
    expect(result.sentiment).toBe("positive");
  });

  it("détecte le négatif en darija", () => {
    const result = analyzeSentiment("khayeb mochkil");
    expect(result.sentiment).toBe("negative");
  });
});

describe("analyzeSentiment - Négation", () => {
  it("la négation inverse le sentiment", () => {
    const pos = analyzeSentiment("Excellent véhicule");
    const neg = analyzeSentiment("Pas excellent du tout");
    expect(pos.score).toBeGreaterThan(neg.score);
  });
});

describe("analyzeAspectSentiment", () => {
  it("analyse les aspects d'un ensemble d'avis", () => {
    const texts = [
      "Le confort est excellent, très spacieux",
      "Consommation correcte, environ 6L/100km",
      "Fiabilité au top, aucun problème en 2 ans",
      "Le prix est un peu élevé mais justifié",
      "Bonne tenue de route sur autoroute",
      "Finition soignée, intérieur qualitatif",
    ];
    const aspects = analyzeAspectSentiment(texts);
    expect(aspects).toHaveProperty("confort");
    expect(aspects).toHaveProperty("consommation");
    expect(aspects.confort.score).toBeGreaterThan(0);
  });

  it("retourne un objet vide pour un tableau vide", () => {
    const aspects = analyzeAspectSentiment([]);
    expect(Object.keys(aspects)).toHaveLength(0);
  });
});

describe("analyzeSentiment - Confiance", () => {
  it("la confiance augmente avec plus de mots de sentiment", () => {
    const low = analyzeSentiment("Le véhicule est là");
    const high = analyzeSentiment("Excellent superbe formidable parfait recommande");
    expect(high.confidence).toBeGreaterThan(low.confidence);
  });
});
