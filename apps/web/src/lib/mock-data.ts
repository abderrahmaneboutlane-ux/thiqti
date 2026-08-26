export interface MockVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  price: number;
  priceFormatted: string;
  city: string;
  explanation: string;
  matchPercent: number;
  badge: string;
  image: string;
  reviews: { score: number; total: number; window: string } | null;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  question: string;
  category: string;
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: "budget",
    question: "Quel est votre budget approximatif ?",
    category: "budget",
    options: [
      { id: "b1", label: "Moins de 150 000 DH", value: "150000" },
      { id: "b2", label: "150 000 – 250 000 DH", value: "200000" },
      { id: "b3", label: "250 000 – 350 000 DH", value: "300000" },
      { id: "b4", label: "350 000 – 500 000 DH", value: "425000" },
      { id: "b5", label: "Plus de 500 000 DH", value: "600000" },
    ],
  },
  {
    id: "etat",
    question: "Preferez-vous une voiture neuve ou d'occasion ?",
    category: "etat",
    options: [
      { id: "e1", label: "Neuve", value: "neuf" },
      { id: "e2", label: "D'occasion", value: "occasion" },
      { id: "e3", label: "Les deux", value: "any" },
    ],
  },
  {
    id: "usage",
    question: "Quel sera votre usage principal ?",
    category: "usage",
    options: [
      { id: "u1", label: "Ville", value: "ville" },
      { id: "u2", label: "Autoroute", value: "autoroute" },
      { id: "u3", label: "Famille", value: "famille" },
      { id: "u4", label: "Travail", value: "travail" },
      { id: "u5", label: "Taxi / VTC", value: "taxi" },
      { id: "u6", label: "Professionnel", value: "pro" },
    ],
  },
  {
    id: "motorisation",
    question: "Quelle motorisation souhaitez-vous ?",
    category: "motorisation",
    options: [
      { id: "m1", label: "Essence", value: "Essence" },
      { id: "m2", label: "Diesel", value: "Diesel" },
      { id: "m3", label: "Hybride", value: "Hybride" },
      { id: "m4", label: "Electrique", value: "Electrique" },
      { id: "m5", label: "Sans preference", value: "any" },
    ],
  },
  {
    id: "critere",
    question: "Qu'est-ce qui est le plus important pour vous ?",
    category: "critere",
    options: [
      { id: "c1", label: "Consommation", value: "economie" },
      { id: "c2", label: "Confort", value: "confort" },
      { id: "c3", label: "Fiabilite", value: "fiabilite" },
      { id: "c4", label: "Technologie", value: "tech" },
      { id: "c5", label: "Grand coffre", value: "espace" },
      { id: "c6", label: "Prix", value: "prix" },
      { id: "c7", label: "Securite", value: "securite" },
    ],
  },
];

export const MOCK_VEHICLES: MockVehicle[] = [
  {
    id: "v1",
    make: "Dacia",
    model: "Sandero",
    year: 2025,
    fuel: "Diesel",
    transmission: "Manuelle",
    bodyType: "Citadine",
    price: 165000,
    priceFormatted: "165 000 DH",
    city: "Casablanca",
    explanation: "Excellent choix — le meilleur rapport qualite/prix, consommation reduite et tres bonne fiabilite.",
    matchPercent: 95,
    badge: "Meilleur rapport Q/P",
    image: "",
    reviews: { score: 7.8, total: 412, window: "18 derniers mois" },
  },
  {
    id: "v2",
    make: "Dacia",
    model: "Duster",
    year: 2025,
    fuel: "Diesel",
    transmission: "Automatique",
    bodyType: "SUV",
    price: 225000,
    priceFormatted: "225 000 DH",
    city: "Rabat",
    explanation: "SUV familial polyvalent, coffre genereux et bonnes capacites tout-terrain.",
    matchPercent: 88,
    badge: "Familiale",
    image: "",
    reviews: { score: 7.5, total: 287, window: "12 derniers mois" },
  },
  {
    id: "v3",
    make: "Renault",
    model: "Clio",
    year: 2025,
    fuel: "Essence",
    transmission: "Automatique",
    bodyType: "Citadine",
    price: 195000,
    priceFormatted: "195 000 DH",
    city: "Casablanca",
    explanation: "Design premium, technologie embarquee et confort superieur a sa categorie.",
    matchPercent: 82,
    badge: "Premium",
    image: "",
    reviews: { score: 7.2, total: 198, window: "12 derniers mois" },
  },
  {
    id: "v4",
    make: "Hyundai",
    model: "Bayon",
    year: 2025,
    fuel: "Essence",
    transmission: "Automatique",
    bodyType: "SUV",
    price: 179000,
    priceFormatted: "179 000 DH",
    city: "Marrakech",
    explanation: "Le meilleur score de consommation, parfait pour les trajets quotidiens en ville.",
    matchPercent: 76,
    badge: "Economique",
    image: "",
    reviews: { score: 7.5, total: 94, window: "12 derniers mois" },
  },
  {
    id: "v5",
    make: "Kia",
    model: "Picanto",
    year: 2025,
    fuel: "Essence",
    transmission: "Manuelle",
    bodyType: "Citadine",
    price: 142000,
    priceFormatted: "142 000 DH",
    city: "Fes",
    explanation: "Citadine agile et economique, ideale pour les trajets courts en ville.",
    matchPercent: 70,
    badge: "Economique",
    image: "",
    reviews: { score: 7.9, total: 156, window: "12 derniers mois" },
  },
  {
    id: "v6",
    make: "Suzuki",
    model: "Vitara",
    year: 2025,
    fuel: "Hybride",
    transmission: "Automatique",
    bodyType: "SUV",
    price: 249000,
    priceFormatted: "249 000 DH",
    city: "Tanger",
    explanation: "Donnees insuffisantes — trop peu d'avis pour etre fiable.",
    matchPercent: 65,
    badge: "A verifier",
    image: "",
    reviews: null,
  },
];

export const ASSISTANT_GREETING =
  "Bonjour ! Je suis SLEIPNIR, votre assistant automobile intelligent. Dites-moi ce que vous recherchez, et je trouverai la voiture parfaite pour vous.";

export const ASSISTANT_CLARIFICATION_PREFIX =
  "Parfait, j'ai bien compris votre demande. Pour affiner ma recherche, repondez a ces quelques questions.";

export const ASSISTANT_SEARCHING =
  "Je recherche les meilleures voitures correspondant a votre profil...";

export const ASSISTANT_DONE =
  "Voici les vehicules qui correspondent le mieux a votre recherche. Classement par pertinence IA.";
