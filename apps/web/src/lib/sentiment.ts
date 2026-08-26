/**
 * Module d'analyse de sentiment pour le baromètre d'e-réputation.
 *
 * Utilise une approche basée sur des dictionnaires pour le français,
 * l'arabe standard et la darija (arabizi inclus).
 *
 * Référence scientifique : approach dictionary-based sentiment analysis,
 * adapté au contexte automobile marocain.
 */

export interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number; // -1.0 (négatif) à 1.0 (positif)
  confidence: number; // 0.0 à 1.0
  positiveWords: string[];
  negativeWords: string[];
}

// Dictionnaire positif français - automobile
const POSITIVE_FR: Record<string, number> = {
  excellent: 0.9,
  parfait: 0.85,
  superbe: 0.85,
  formidable: 0.8,
  magnifique: 0.85,
  genial: 0.8,
  remarquable: 0.8,
  fiable: 0.75,
  solide: 0.7,
  performant: 0.75,
  puissant: 0.7,
  economique: 0.7,
  confortable: 0.75,
  spacieux: 0.7,
  pratique: 0.65,
  recommande: 0.8,
  satisfaits: 0.75,
  satisfait: 0.75,
  content: 0.7,
  heureux: 0.75,
  impressionnant: 0.8,
  fluide: 0.65,
  agile: 0.65,
  responsive: 0.6,
  silencieux: 0.6,
  securitaire: 0.65,
  moderne: 0.6,
  elegant: 0.7,
  qualite: 0.6,
  top: 0.7,
  nickel: 0.7,
  cool: 0.5,
  apprecie: 0.65,
  adore: 0.8,
  aima: 0.7,
  aime: 0.6,
  preferable: 0.6,
  ideal: 0.8,
  robuste: 0.7,
  durable: 0.65,
};

// Dictionnaire négatif français - automobile
const NEGATIVE_FR: Record<string, number> = {
  mauvais: -0.7,
  terrible: -0.8,
  horrible: -0.85,
  catastrophique: -0.9,
  decevant: -0.7,
  lent: -0.5,
  bruyant: -0.5,
  cher: -0.4,
  defectueux: -0.8,
  panne: -0.7,
  probleme: -0.6,
  defaut: -0.5,
  ennuyeux: -0.5,
  regret: -0.6,
  dommage: -0.5,
  faible: -0.5,
  moyen: -0.3,
  passable: -0.3,
  lourd: -0.4,
  etroit: -0.4,
  petit: -0.3,
  fragile: -0.6,
  casse: -0.7,
  rouille: -0.7,
  usure: -0.5,
  consommation: -0.3,
  polluant: -0.5,
  depense: -0.4,
  desagreable: -0.6,
  moche: -0.6,
  laid: -0.6,
  penible: -0.5,
  insatisfait: -0.7,
  mecontent: -0.7,
  arnaque: -0.9,
  escroquerie: -0.9,
  vol: -0.8,
};

// Dictionnaire positif darija/arabe
const POSITIVE_AR: Record<string, number> = {
  mzyan: 0.8,
  "مزيان": 0.8,
  zwina: 0.75,
  "زوينة": 0.75,
  mezyan: 0.8,
  zwin: 0.75,
  lbhar: 0.6,
  lahlou: 0.6,
  sahbi: 0.5,
  lmdam: 0.7,
  mrigl: 0.6,
  moukhtalf: 0.6,
  rani: 0.4,
  "بزاف": 0.7,
  bzaf: 0.7,
  la: 0.5,
  "ماشاء": 0.8,
  mashallah: 0.8,
  hamdoulah: 0.7,
  "الحمد": 0.7,
  tbarek: 0.7,
  "بارك": 0.7,
  lmiftah: 0.6,
  sber: 0.5,
  "صبور": 0.5,
  lmoghamra: 0.6,
  l9ima: 0.5,
};

// Dictionnaire négatif darija/arabe
const NEGATIVE_FR_AR: Record<string, number> = {
  khayeb: -0.7,
  "خايب": -0.7,
  ziir: -0.6,
  "زير": -0.6,
  mochkil: -0.6,
  "مشكل": -0.6,
  taht: -0.5,
  "تحت": -0.5,
  mchiti: -0.5,
  "مشيت": -0.5,
  tayeb: -0.3,
  "طيب": -0.3,
  "3adi": -0.2,
  "عادي": -0.2,
  ghaly: -0.4,
  "غالي": -0.4,
  khdam: -0.5,
  "خادم": -0.5,
  tarek: -0.6,
  "طارق": -0.6,
  moujarrad: -0.3,
  "مجرد": -0.3,
};

// Mot-clés d'intensification
const INTENSIFIERS: Record<string, number> = {
  tres: 1.5,
  "très": 1.5,
  extremement: 2.0,
    "extrêmement": 2.0,
    "un peu": 0.5,
    plutot: 0.7,
  "plutôt": 0.7,
  assez: 0.8,
  vraiment: 1.3,
  franchement: 1.2,
  absolument: 1.5,
  vachement: 1.3,
  grave: 1.3,
  "بزاف": 1.5,
  bzaf: 1.5,
  "واز": 1.3,
  "تو": 1.2,
};

// Négation (inverse le sentiment)
const NEGATIONS = [
  "ne",
  "pas",
  "jamais",
  "aucun",
  "rien",
  "ni",
  "non",
  "sans",
  "guere",
  "nul",
  "point",
  "la",
  "ما",
  "لا",
  "ماشي",
];

// Ponctuation et émoticônes
const EMOTIONS: Record<string, number> = {
  "!!!": 0.3,
  "!!": 0.2,
  "!": 0.1,
  "???": -0.2,
  "??": -0.1,
  ":-)": 0.3,
  ":)": 0.3,
  ":-D": 0.4,
  ":D": 0.4,
  "<3": 0.4,
  ":-(": -0.3,
  ":(": -0.3,
  ":-/": -0.2,
  ";-)": 0.1,
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s\u0600-\u06FF\u00C0-\u024F\d]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(" ").filter((t) => t.length > 0);
}

function containsNegation(tokens: string[], position: number): boolean {
  const windowStart = Math.max(0, position - 3);
  for (let i = windowStart; i < position; i++) {
    if (NEGATIONS.includes(tokens[i])) return true;
  }
  return false;
}

function getIntensifier(tokens: string[], position: number): number {
  if (position > 0) {
    const prev = tokens[position - 1];
    if (INTENSIFIERS[prev]) return INTENSIFIERS[prev];
  }
  return 1.0;
}

/**
 * Analyse le sentiment d'un texte en langage naturel.
 *
 * @param text Le texte à analyser
 * @returns Résultat de l'analyse de sentiment
 */
export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: "neutral",
      score: 0,
      confidence: 0,
      positiveWords: [],
      negativeWords: [],
    };
  }

  const tokens = tokenize(text);
  let totalScore = 0;
  let matchedWords = 0;
  const positiveWords: string[] = [];
  const negativeWords: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let wordScore = 0;
    let found = false;

    // Vérifier dictionnaire positif français
    if (POSITIVE_FR[token]) {
      wordScore = POSITIVE_FR[token];
      found = true;
    }

    // Vérifier dictionnaire négatif français
    if (NEGATIVE_FR[token]) {
      wordScore = NEGATIVE_FR[token];
      found = true;
    }

    // Vérifier dictionnaire positif darija/arabe
    if (POSITIVE_AR[token]) {
      wordScore = POSITIVE_AR[token];
      found = true;
    }

    // Vérifier dictionnaire négatif darija/arabe
    if (NEGATIVE_FR_AR[token]) {
      wordScore = NEGATIVE_FR_AR[token];
      found = true;
    }

    if (found) {
      // Appliquer intensificateur
      const intensifier = getIntensifier(tokens, i);
      wordScore *= intensifier;

      // Appliquer négation
      if (containsNegation(tokens, i)) {
        wordScore *= -0.8;
      }

      totalScore += wordScore;
      matchedWords++;

      if (wordScore > 0) {
        positiveWords.push(token);
      } else if (wordScore < 0) {
        negativeWords.push(token);
      }
    }
  }

  // Vérifier émoticônes
  for (const [emoticon, score] of Object.entries(EMOTIONS)) {
    if (text.includes(emoticon)) {
      totalScore += score;
      matchedWords++;
    }
  }

  // Vérifier ponctuation excessive
  if (text.includes("!!!")) totalScore += 0.2;
  if (text.includes("???")) totalScore -= 0.1;

  // Calculer score normalisé entre -1 et 1
  const normalizedScore =
    matchedWords > 0
      ? Math.max(-1, Math.min(1, totalScore / matchedWords))
      : 0;

  // Calculer confiance (basée sur le nombre de mots matchés)
  const confidence = Math.min(1, matchedWords / Math.max(1, tokens.length * 0.3));

  // Déterminer sentiment
  let sentiment: "positive" | "negative" | "neutral";
  if (normalizedScore > 0.15) {
    sentiment = "positive";
  } else if (normalizedScore < -0.15) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  return {
    sentiment,
    score: Math.round(normalizedScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    positiveWords,
    negativeWords,
  };
}

/**
 * Analyse le sentiment orienté aspects pour un modèle de véhicule.
 *
 * @param texts Tableau de textes d'avis
 * @returns Scores par aspect
 */
export function analyzeAspectSentiment(
  texts: string[]
): Record<string, { score: number; count: number }> {
  const aspects: Record<string, { keywords: string[]; scores: number[] }> = {
    confort: {
      keywords: ["confort", "confortable", "sièges", "suspsension", "bruit", "insonorisé", "spacieux", "مريح", "راحت"],
      scores: [],
    },
    consommation: {
      keywords: ["consommation", "carburant", "essence", "diesel", "économique", "autonomie", "réservoir", "consommation", "كاستوم"],
      scores: [],
    },
    fiabilite: {
      keywords: ["fiable", "fiabilité", "panne", "problème", "défaut", "durée", "solidité", "المخمل"],
      scores: [],
    },
    rapport_prix: {
      keywords: ["prix", "rapport", "qualité", "cher", "coût", "valeur", "l9ima", "ثمن"],
      scores: [],
    },
    tenue_route: {
      keywords: ["route", "virage", "direction", "tenue", "comportement", "dynamique", "sûr"],
      scores: [],
    },
    finition: {
      keywords: ["finition", "intérieur", "extérieur", "matériaux", "plastique", "cuir", "design", "finish"],
      scores: [],
    },
  };

  for (const text of texts) {
    const lowerText = normalizeText(text);
    const sentiment = analyzeSentiment(text);

    for (const [, aspect] of Object.entries(aspects)) {
      const hasKeyword = aspect.keywords.some((kw) =>
        lowerText.includes(kw.toLowerCase())
      );
      if (hasKeyword) {
        aspect.scores.push(sentiment.score);
      }
    }
  }

  const result: Record<string, { score: number; count: number }> = {};
  for (const [name, aspect] of Object.entries(aspects)) {
    if (aspect.scores.length > 0) {
      const avg = aspect.scores.reduce((a, b) => a + b, 0) / aspect.scores.length;
      result[name] = {
        score: Math.round((avg + 1) * 5 * 10) / 10, // Convertir -1..1 en 0..10
        count: aspect.scores.length,
      };
    }
  }

  return result;
}
