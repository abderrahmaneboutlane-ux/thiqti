const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès',
  'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
  'El Jadida', 'Mohammédia', 'Nador', 'Béni Mellal', 'Taza'
];

const COLORS = [
  'Blanc Nacré', 'Gris Métallisé', 'Noir Intense', 'Bleu Océan',
  'Rouge Rubis', 'Gris Anthracite', 'Argent', 'Vert Forêt', 'Bronze'
];

const SOURCES = [
  'Dacia Officiel', 'Renault Officiel', 'Peugeot Officiel', 'Volkswagen Officiel',
  'Toyota Maroc', 'Hyundai Maroc', 'Kia Maroc', 'Mercedes Officiel', 'BMW Smeia',
  'Avito', 'Moteur.ma', 'Auto24.ma', 'Kifal Auto', 'Auto Hall'
];

const BRANDS_MODELS = [
  { make: 'Dacia', models: [
    { model: 'Sandero', body: 'Citadine', fuel: 'Essence', price: 149900, places: 5, power: 90, trunk: 328, cons: 5.2 },
    { model: 'Sandero Stepway', body: 'Crossover', fuel: 'Essence', price: 172900, places: 5, power: 100, trunk: 328, cons: 5.6 },
    { model: 'Logan', body: 'Berline', fuel: 'Diesel', price: 169900, places: 5, power: 95, trunk: 528, cons: 4.3 },
    { model: 'Duster', body: 'SUV', fuel: 'Diesel', price: 239900, places: 5, power: 115, trunk: 478, cons: 4.8 },
    { model: 'Jogger', body: 'Monospace', fuel: 'Hybride', price: 249900, places: 7, power: 140, trunk: 708, cons: 4.9 },
    { model: 'Spring', body: 'Citadine', fuel: 'Electrique', price: 139900, places: 4, power: 65, trunk: 290, cons: 0.0 }
  ]},
  { make: 'Renault', models: [
    { model: 'Clio', body: 'Citadine', fuel: 'Hybride', price: 220000, places: 5, power: 145, trunk: 300, cons: 4.2 },
    { model: 'Megane', body: 'Berline', fuel: 'Diesel', price: 269000, places: 5, power: 115, trunk: 473, cons: 4.5 },
    { model: 'Captur', body: 'SUV', fuel: 'Hybride', price: 245000, places: 5, power: 145, trunk: 422, cons: 4.7 },
    { model: 'Austral', body: 'SUV', fuel: 'Hybride', price: 359000, places: 5, power: 200, trunk: 500, cons: 4.8 },
    { model: 'Kardian', body: 'Crossover', fuel: 'Essence', price: 189000, places: 5, power: 125, trunk: 410, cons: 5.9 },
    { model: 'Express', body: 'Utilitaire', fuel: 'Diesel', price: 155000, places: 2, power: 95, trunk: 3300, cons: 5.1 }
  ]},
  { make: 'Peugeot', models: [
    { model: '208', body: 'Citadine', fuel: 'Essence', price: 195000, places: 5, power: 100, trunk: 311, cons: 5.3 },
    { model: '2008', body: 'SUV', fuel: 'Hybride', price: 279000, places: 5, power: 136, trunk: 434, cons: 4.9 },
    { model: '308', body: 'Berline', fuel: 'Diesel', price: 299000, places: 5, power: 130, trunk: 412, cons: 4.6 },
    { model: '3008', body: 'SUV', fuel: 'Hybride', price: 389000, places: 5, power: 136, trunk: 520, cons: 5.5 },
    { model: '5008', body: 'SUV', fuel: 'Diesel', price: 429000, places: 7, power: 130, trunk: 780, cons: 5.4 },
    { model: 'Landtrek', body: 'Pick-up', fuel: 'Diesel', price: 289000, places: 5, power: 150, trunk: 1000, cons: 7.8 }
  ]},
  { make: 'Volkswagen', models: [
    { model: 'Polo', body: 'Citadine', fuel: 'Essence', price: 209000, places: 5, power: 95, trunk: 351, cons: 5.4 },
    { model: 'Golf 8', body: 'Berline', fuel: 'Essence', price: 319000, places: 5, power: 150, trunk: 381, cons: 5.7 },
    { model: 'T-Roc', body: 'SUV', fuel: 'Essence', price: 315000, places: 5, power: 150, trunk: 445, cons: 6.2 },
    { model: 'Tiguan', body: 'SUV', fuel: 'Diesel', price: 399000, places: 5, power: 150, trunk: 652, cons: 5.6 },
    { model: 'Taigo', body: 'Crossover', fuel: 'Essence', price: 249000, places: 5, power: 110, trunk: 440, cons: 5.5 },
    { model: 'Touareg', body: 'SUV', fuel: 'Diesel', price: 799000, places: 5, power: 286, trunk: 810, cons: 8.1 }
  ]},
  { make: 'Toyota', models: [
    { model: 'Yaris', body: 'Citadine', fuel: 'Hybride', price: 219000, places: 5, power: 116, trunk: 286, cons: 3.9 },
    { model: 'Yaris Cross', body: 'SUV', fuel: 'Hybride', price: 289000, places: 5, power: 116, trunk: 397, cons: 4.4 },
    { model: 'Corolla', body: 'Berline', fuel: 'Hybride', price: 299000, places: 5, power: 140, trunk: 471, cons: 4.5 },
    { model: 'C-HR', body: 'SUV', fuel: 'Hybride', price: 329000, places: 5, power: 140, trunk: 388, cons: 4.7 },
    { model: 'RAV4', body: 'SUV', fuel: 'Hybride', price: 429000, places: 5, power: 218, trunk: 580, cons: 5.6 },
    { model: 'Hilux', body: 'Pick-up', fuel: 'Diesel', price: 359000, places: 5, power: 150, trunk: 1200, cons: 8.2 },
    { model: 'Land Cruiser Prado', body: 'SUV', fuel: 'Diesel', price: 699000, places: 7, power: 204, trunk: 640, cons: 8.9 }
  ]},
  { make: 'Hyundai', models: [
    { model: 'i10', body: 'Citadine', fuel: 'Essence', price: 155000, places: 5, power: 84, trunk: 252, cons: 5.1 },
    { model: 'i20', body: 'Citadine', fuel: 'Essence', price: 199000, places: 5, power: 100, trunk: 352, cons: 5.5 },
    { model: 'Bayon', body: 'Crossover', fuel: 'Essence', price: 215000, places: 5, power: 100, trunk: 411, cons: 5.6 },
    { model: 'Creta', body: 'SUV', fuel: 'Diesel', price: 269000, places: 5, power: 115, trunk: 433, cons: 4.9 },
    { model: 'Tucson', body: 'SUV', fuel: 'Hybride', price: 379000, places: 5, power: 230, trunk: 616, cons: 5.7 },
    { model: 'Santa Fe', body: 'SUV', fuel: 'Hybride', price: 489000, places: 7, power: 230, trunk: 634, cons: 6.4 },
    { model: 'Ioniq 5', body: 'SUV', fuel: 'Electrique', price: 549000, places: 5, power: 229, trunk: 527, cons: 0.0 }
  ]},
  { make: 'Kia', models: [
    { model: 'Picanto', body: 'Citadine', fuel: 'Essence', price: 145000, places: 5, power: 67, trunk: 255, cons: 5.0 },
    { model: 'Rio', body: 'Citadine', fuel: 'Essence', price: 179000, places: 5, power: 100, trunk: 325, cons: 5.4 },
    { model: 'Stonic', body: 'Crossover', fuel: 'Essence', price: 229000, places: 5, power: 100, trunk: 352, cons: 5.6 },
    { model: 'Sportage', body: 'SUV', fuel: 'Diesel', price: 359000, places: 5, power: 136, trunk: 571, cons: 5.3 },
    { model: 'Sorento', body: 'SUV', fuel: 'Hybride', price: 499000, places: 7, power: 230, trunk: 616, cons: 6.5 },
    { model: 'EV6', body: 'SUV', fuel: 'Electrique', price: 589000, places: 5, power: 229, trunk: 520, cons: 0.0 }
  ]},
  { make: 'Mercedes-Benz', models: [
    { model: 'Classe A', body: 'Berline', fuel: 'Diesel', price: 439000, places: 5, power: 150, trunk: 370, cons: 4.8 },
    { model: 'CLA', body: 'Berline', fuel: 'Essence', price: 529000, places: 5, power: 163, trunk: 460, cons: 5.9 },
    { model: 'Classe C', body: 'Berline', fuel: 'Diesel', price: 619000, places: 5, power: 200, trunk: 455, cons: 4.9 },
    { model: 'GLA', body: 'SUV', fuel: 'Diesel', price: 499000, places: 5, power: 150, trunk: 435, cons: 5.2 },
    { model: 'GLC', body: 'SUV', fuel: 'Hybride', price: 749000, places: 5, power: 204, trunk: 620, cons: 5.8 },
    { model: 'Classe E', body: 'Berline', fuel: 'Diesel', price: 799000, places: 5, power: 197, trunk: 540, cons: 5.2 }
  ]},
  { make: 'BMW', models: [
    { model: 'Série 1', body: 'Berline', fuel: 'Diesel', price: 399000, places: 5, power: 150, trunk: 380, cons: 4.9 },
    { model: 'Série 2 Gran Coupé', body: 'Berline', fuel: 'Diesel', price: 449000, places: 5, power: 150, trunk: 430, cons: 4.8 },
    { model: 'Série 3', body: 'Berline', fuel: 'Diesel', price: 569000, places: 5, power: 190, trunk: 480, cons: 4.8 },
    { model: 'X1', body: 'SUV', fuel: 'Diesel', price: 469000, places: 5, power: 150, trunk: 540, cons: 5.1 },
    { model: 'X3', body: 'SUV', fuel: 'Diesel', price: 679000, places: 5, power: 190, trunk: 550, cons: 5.9 },
    { model: 'X5', body: 'SUV', fuel: 'Hybride', price: 989000, places: 5, power: 298, trunk: 650, cons: 7.2 }
  ]},
  { make: 'Audi', models: [
    { model: 'A3 Sportback', body: 'Compacte', fuel: 'Diesel', price: 389000, places: 5, power: 150, trunk: 380, cons: 4.6 },
    { model: 'A4', body: 'Berline', fuel: 'Diesel', price: 499000, places: 5, power: 190, trunk: 460, cons: 4.9 },
    { model: 'Q2', body: 'SUV', fuel: 'Essence', price: 349000, places: 5, power: 150, trunk: 405, cons: 6.0 },
    { model: 'Q3', body: 'SUV', fuel: 'Diesel', price: 469000, places: 5, power: 150, trunk: 530, cons: 5.3 },
    { model: 'Q5', body: 'SUV', fuel: 'Diesel', price: 649000, places: 5, power: 204, trunk: 520, cons: 6.2 }
  ]},
  { make: 'MG', models: [
    { model: '3', body: 'Citadine', fuel: 'Essence', price: 149900, places: 5, power: 106, trunk: 293, cons: 5.8 },
    { model: 'ZS', body: 'SUV', fuel: 'Hybride', price: 219900, places: 5, power: 194, trunk: 448, cons: 5.0 },
    { model: 'HS', body: 'SUV', fuel: 'Hybride', price: 289900, places: 5, power: 258, trunk: 463, cons: 6.1 },
    { model: '4 EV', body: 'Compacte', fuel: 'Electrique', price: 319000, places: 5, power: 170, trunk: 363, cons: 0.0 },
    { model: 'Cyberster', body: 'Cabriolet', fuel: 'Electrique', price: 499900, places: 2, power: 340, trunk: 249, cons: 0.0 }
  ]},
  { make: 'BYD', models: [
    { model: 'Seagull', body: 'Citadine', fuel: 'Electrique', price: 149900, places: 4, power: 75, trunk: 230, cons: 0.0 },
    { model: 'Dolphin', body: 'Citadine', fuel: 'Electrique', price: 219900, places: 5, power: 95, trunk: 345, cons: 0.0 },
    { model: 'Atto 3', body: 'SUV', fuel: 'Electrique', price: 319900, places: 5, power: 204, trunk: 440, cons: 0.0 },
    { model: 'Seal', body: 'Berline', fuel: 'Electrique', price: 419900, places: 5, power: 313, trunk: 402, cons: 0.0 },
    { model: 'Seal U', body: 'SUV', fuel: 'Electrique', price: 389900, places: 5, power: 218, trunk: 552, cons: 0.0 },
    { model: 'Tang', body: 'SUV', fuel: 'Electrique', price: 549900, places: 7, power: 517, trunk: 940, cons: 0.0 },
    { model: 'Han', body: 'Berline', fuel: 'Electrique', price: 499900, places: 5, power: 517, trunk: 410, cons: 0.0 }
  ]},
  { make: 'Citroën', models: [
    { model: 'C3', body: 'Citadine', fuel: 'Essence', price: 159000, places: 5, power: 83, trunk: 300, cons: 5.4 },
    { model: 'C3 Aircross', body: 'SUV', fuel: 'Diesel', price: 219000, places: 5, power: 100, trunk: 410, cons: 4.8 },
    { model: 'C4', body: 'Berline', fuel: 'Diesel', price: 249000, places: 5, power: 130, trunk: 380, cons: 4.7 },
    { model: 'C5 Aircross', body: 'SUV', fuel: 'Diesel', price: 329000, places: 5, power: 130, trunk: 580, cons: 5.2 },
    { model: 'Berlingo', body: 'Utilitaire', fuel: 'Diesel', price: 209000, places: 5, power: 100, trunk: 775, cons: 5.3 }
  ]},
  { make: 'Nissan', models: [
    { model: 'Micra', body: 'Citadine', fuel: 'Essence', price: 169000, places: 5, power: 92, trunk: 300, cons: 5.3 },
    { model: 'Juke', body: 'SUV', fuel: 'Hybride', price: 259000, places: 5, power: 143, trunk: 422, cons: 5.0 },
    { model: 'Qashqai', body: 'SUV', fuel: 'Hybride', price: 349000, places: 5, power: 190, trunk: 504, cons: 5.3 },
    { model: 'X-Trail', body: 'SUV', fuel: 'Hybride', price: 439000, places: 7, power: 204, trunk: 575, cons: 5.8 },
    { model: 'Navara', body: 'Pick-up', fuel: 'Diesel', price: 349000, places: 5, power: 160, trunk: 1100, cons: 7.9 }
  ]},
  { make: 'Fiat', models: [
    { model: '500', body: 'Citadine', fuel: 'Hybride', price: 179000, places: 4, power: 70, trunk: 185, cons: 4.7 },
    { model: 'Panda', body: 'Citadine', fuel: 'Hybride', price: 139000, places: 5, power: 70, trunk: 225, cons: 4.8 },
    { model: 'Tipo', body: 'Berline', fuel: 'Diesel', price: 199000, places: 5, power: 130, trunk: 520, cons: 4.6 },
    { model: 'Doblo', body: 'Utilitaire', fuel: 'Diesel', price: 195000, places: 5, power: 100, trunk: 775, cons: 5.2 },
    { model: 'Ducato', body: 'Utilitaire', fuel: 'Diesel', price: 289000, places: 3, power: 140, trunk: 8000, cons: 8.5 }
  ]},
  { make: 'Opel', models: [
    { model: 'Corsa', body: 'Citadine', fuel: 'Essence', price: 199900, places: 5, power: 100, trunk: 309, cons: 5.2 },
    { model: 'Corsa Electric', body: 'Citadine', fuel: 'Electrique', price: 319900, places: 5, power: 156, trunk: 267, cons: 0.0 },
    { model: 'Mokka', body: 'SUV', fuel: 'Essence', price: 259900, places: 5, power: 130, trunk: 350, cons: 5.9 },
    { model: 'Astra', body: 'Berline', fuel: 'Essence', price: 249900, places: 5, power: 130, trunk: 422, cons: 5.6 },
    { model: 'Grandland', body: 'SUV', fuel: 'Hybride', price: 339900, places: 5, power: 136, trunk: 550, cons: 5.5 },
    { model: 'Frontera', body: 'SUV', fuel: 'Electrique', price: 219900, places: 5, power: 113, trunk: 460, cons: 0.0 }
  ]},
  { make: 'Chery', models: [
    { model: 'Tiggo 2 Pro', body: 'Crossover', fuel: 'Essence', price: 169000, places: 5, power: 109, trunk: 420, cons: 6.2 },
    { model: 'Tiggo 4 Pro', body: 'SUV', fuel: 'Essence', price: 219000, places: 5, power: 147, trunk: 440, cons: 6.8 },
    { model: 'Tiggo 7 Pro', body: 'SUV', fuel: 'Essence', price: 269000, places: 5, power: 156, trunk: 475, cons: 7.1 },
    { model: 'Tiggo 8 Pro', body: 'SUV', fuel: 'Essence', price: 349000, places: 7, power: 197, trunk: 890, cons: 7.9 }
  ]},
  { make: 'Geely', models: [
    { model: 'GX3 Pro', body: 'Crossover', fuel: 'Essence', price: 169000, places: 5, power: 102, trunk: 400, cons: 6.5 },
    { model: 'Coolray', body: 'SUV', fuel: 'Essence', price: 239000, places: 5, power: 172, trunk: 330, cons: 5.8 },
    { model: 'Starray', body: 'SUV', fuel: 'Essence', price: 299000, places: 5, power: 218, trunk: 560, cons: 6.7 },
    { model: 'Monjaro', body: 'SUV', fuel: 'Essence', price: 399000, places: 5, power: 238, trunk: 562, cons: 7.5 }
  ]},
  { make: 'Cupra', models: [
    { model: 'Formentor', body: 'SUV', fuel: 'Essence', price: 479000, places: 5, power: 310, trunk: 420, cons: 7.7 },
    { model: 'Formentor Hybrid', body: 'SUV', fuel: 'Hybride', price: 429000, places: 5, power: 204, trunk: 345, cons: 4.8 },
    { model: 'Leon', body: 'Compacte', fuel: 'Essence', price: 449000, places: 5, power: 300, trunk: 380, cons: 7.2 }
  ]},
  { make: 'Jeep', models: [
    { model: 'Renegade', body: 'SUV', fuel: 'Diesel', price: 249000, places: 5, power: 130, trunk: 351, cons: 5.4 },
    { model: 'Compass', body: 'SUV', fuel: 'Hybride', price: 349000, places: 5, power: 130, trunk: 438, cons: 5.6 },
    { model: 'Wrangler', body: 'SUV', fuel: 'Essence', price: 689000, places: 5, power: 272, trunk: 533, cons: 9.8 }
  ]},
  { make: 'Suzuki', models: [
    { model: 'Swift', body: 'Citadine', fuel: 'Hybride', price: 179000, places: 5, power: 83, trunk: 265, cons: 4.4 },
    { model: 'Vitara', body: 'SUV', fuel: 'Hybride', price: 249000, places: 5, power: 129, trunk: 375, cons: 5.4 },
    { model: 'Jimny', body: 'SUV', fuel: 'Essence', price: 239000, places: 4, power: 102, trunk: 85, cons: 6.8 },
    { model: 'Fronx', body: 'Crossover', fuel: 'Hybride', price: 219000, places: 5, power: 103, trunk: 304, cons: 4.9 }
  ]},
  { make: 'Seat', models: [
    { model: 'Ibiza', body: 'Citadine', fuel: 'Essence', price: 189000, places: 5, power: 110, trunk: 355, cons: 5.2 },
    { model: 'Arona', body: 'SUV', fuel: 'Essence', price: 229000, places: 5, power: 110, trunk: 400, cons: 5.4 },
    { model: 'Leon', body: 'Berline', fuel: 'Diesel', price: 279000, places: 5, power: 150, trunk: 380, cons: 4.6 },
    { model: 'Ateca', body: 'SUV', fuel: 'Diesel', price: 329000, places: 5, power: 150, trunk: 510, cons: 5.3 }
  ]},
  { make: 'Skoda', models: [
    { model: 'Fabia', body: 'Citadine', fuel: 'Essence', price: 179000, places: 5, power: 95, trunk: 380, cons: 5.1 },
    { model: 'Octavia', body: 'Berline', fuel: 'Diesel', price: 319000, places: 5, power: 150, trunk: 600, cons: 4.5 },
    { model: 'Kamiq', body: 'SUV', fuel: 'Essence', price: 239000, places: 5, power: 110, trunk: 400, cons: 5.4 },
    { model: 'Kodiaq', body: 'SUV', fuel: 'Diesel', price: 449000, places: 7, power: 150, trunk: 835, cons: 5.7 }
  ]},
  { make: 'Porsche', models: [
    { model: 'Macan', body: 'SUV', fuel: 'Essence', price: 890000, places: 5, power: 265, trunk: 488, cons: 9.3 },
    { model: 'Cayenne', body: 'SUV', fuel: 'Hybride', price: 1390000, places: 5, power: 470, trunk: 627, cons: 7.8 },
    { model: 'Taycan', body: 'Berline', fuel: 'Electrique', price: 1450000, places: 4, power: 408, trunk: 407, cons: 0.0 }
  ]}
];

const REVIEW_AUTHORS = [
  'Mehdi Bennani', 'Youssef El Amrani', 'Fatima Zahra Tazi', 'Hamza Alami',
  'Sofia Berrada', 'Amine Chraibi', 'Kenza Idrissi', 'Omar Benjelloun',
  'Salma Guessous', 'Tariq Mansouri', 'Nadia Bouazza', 'Karim Fassi'
];

const REVIEW_TEMPLATES = [
  { cat: 'Confort', textFr: 'Excellente insonorisation et assise très agréable sur autoroute et ville.', textAr: 'راحة ممتازة وسياقة ناعمة بزاف في الطريق.', sent: 'positive', rating: 9.0 },
  { cat: 'Consommation', textFr: 'Consommation très modérée, un plein me fait plus de 850 km sans forcer.', textAr: 'اقتصادية بزاف في المازوط، ماتاكلش.', sent: 'positive', rating: 9.2 },
  { cat: 'Fiabilité', textFr: 'Aucun problème mécanique majeur en 3 ans, entretien classique très abordable.', textAr: 'طوموبيل صحيحة وميكانيك موثوق مكاينش مشاكل.', sent: 'positive', rating: 8.8 },
  { cat: 'Prix', textFr: 'Rapport qualité-prix imbattable au Maroc, pièces de rechange disponibles partout.', textAr: 'ثمن مناسب وقطع الغيار موجودين ورخاص.', sent: 'positive', rating: 8.5 },
  { cat: 'Design', textFr: 'Ligne moderne et finitions intérieures soignées, look très valorisant.', textAr: 'ديزاين زوين وعصري بزاف.', sent: 'positive', rating: 8.7 },
  { cat: 'Équipements', textFr: 'Écran tactile réactif avec Apple CarPlay et Android Auto sans fil.', textAr: 'فيها كامل التجهيزات والكونيكسيون ساهلة.', sent: 'positive', rating: 8.0 },
  { cat: 'Sûreté', textFr: 'Freinage d\'urgence efficace, tenue de route sécurisante même par temps de pluie.', textAr: 'ثابتة في الفيراجات والفران مزيان.', sent: 'positive', rating: 8.9 },
  { cat: 'Consommation', textFr: 'Consommation un peu élevée en ville avec la climatisation activée.', textAr: 'في الزحام ومع لاكليم كاتستهلك شوية.', sent: 'negative', rating: 5.5 },
  { cat: 'Équipements', textFr: 'Plastiques durs présents sur les panneaux de porte mais assemblage correct.', textAr: 'البلاستيك شوية قاصح ولكن التجميع مقبول.', sent: 'neutral', rating: 6.8 },
  { cat: 'Confort', textFr: 'Suspension un peu ferme sur les dos d\'âne et routes secondaires.', textAr: 'قاصحة شوية في الدودانات والطرقات المحفورة.', sent: 'neutral', rating: 6.5 }
];

console.log('Generating 1750+ vehicles catalog...');

const allVehicles = [];
const allReviews = [];
const targetCount = 1750;

let count = 0;

while (count < targetCount) {
  for (const brandData of BRANDS_MODELS) {
    if (count >= targetCount) break;
    for (const modelSpec of brandData.models) {
      if (count >= targetCount) break;

      const isNew = count < 250 ? (Math.random() > 0.4) : (Math.random() > 0.85);
      const year = isNew ? (Math.random() > 0.5 ? 2025 : 2026) : Math.floor(Math.random() * 11) + 2014;
      const km = isNew ? 0 : Math.floor(Math.random() * 140000) + 8000;
      
      const priceFactor = isNew ? (0.95 + Math.random() * 0.1) : Math.max(0.35, 1 - (2026 - year) * 0.075 - (km / 350000));
      const priceMad = Math.round((modelSpec.price * priceFactor) / 1000) * 1000;
      const priceDisplay = priceMad.toLocaleString('fr-FR') + ' DH';

      const transmission = modelSpec.body === 'Electrique' || modelSpec.body === 'Hybride' || modelSpec.price > 300000 || Math.random() > 0.5
        ? 'Automatique'
        : 'Manuelle';

      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const source = isNew ? (brandData.make + ' Officiel') : SOURCES[Math.floor(Math.random() * SOURCES.length)];
      
      const vehicleId = uuidv4();
      const slug = slugify(`${brandData.make}-${modelSpec.model}-${year}-${count + 1}`);
      const name = `${brandData.make} ${modelSpec.model} ${isNew ? 'Neuf' : year}`;
      const sub = isNew ? `${year} - ${transmission}` : `${year} - ${km.toLocaleString('fr-FR')} km`;

      const scoreNum = Math.min(98, Math.max(65, Math.round((80 + Math.random() * 16 + (isNew ? 4 : 0)) * 10) / 10));
      const scoreNormalized = Math.round((scoreNum / 10) * 10) / 10;
      const nbReviews = Math.floor(Math.random() * 120) + 12;

      const modelFamily = slugify(modelSpec.model);
      const cleanMake = encodeURIComponent(brandData.make.trim());
      const cleanModel = encodeURIComponent(modelSpec.model.trim());

      const BRAND_HD_POOLS = {
        'dacia': ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80'],
        'renault': ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80'],
        'peugeot': ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80'],
        'volkswagen': ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'],
        'toyota': ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80'],
        'hyundai': ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'],
        'kia': ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80'],
        'mercedes-benz': ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80'],
        'bmw': ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'],
        'audi': ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'],
        'byd': ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop&q=80'],
        'mg': ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80'],
        'default': ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80']
      };

      const mkLower = brandData.make.toLowerCase();
      const pool = BRAND_HD_POOLS[mkLower] || BRAND_HD_POOLS['default'];
      const imageUrl = pool[Math.floor(Math.random() * pool.length)];
      const photos = [
        imageUrl,
        pool[(pool.indexOf(imageUrl) + 1) % pool.length] || pool[0],
        `https://cdn.imagin.studio/getimage?customer=hrjavascript-mastery&make=${cleanMake}&modelFamily=${cleanModel}&angle=23&width=800`,
        `https://cdn.imagin.studio/getimage?customer=hrjavascript-mastery&make=${cleanMake}&modelFamily=${cleanModel}&angle=1&width=800`
      ];

      const description = `${name} disponible à ${city}. Véhicule ${isNew ? 'neuf avec garantie constructeur' : 'd\'occasion révisé et certifié Thiqti'}. Motorisation ${modelSpec.fuel}, boîte ${transmission}, puissance de ${modelSpec.power} ch.`;

      const vehicle = {
        id: vehicleId,
        slug: slug,
        name: name,
        sub: sub,
        make: brandData.make,
        model: modelSpec.model,
        model_family: modelFamily,
        fuel: modelSpec.fuel,
        body_type: modelSpec.body,
        transmission: transmission,
        year: year,
        price_mad: priceMad,
        price_display: priceDisplay,
        km: km,
        city: city,
        color: color,
        places: modelSpec.places,
        engine_power_ch: modelSpec.power,
        consumption_l100km: modelSpec.cons,
        co2_gkm: Math.round(modelSpec.cons * 24),
        acceleration_0_100: Math.round((14 - modelSpec.power / 35) * 10) / 10,
        trunk_liters: modelSpec.trunk,
        inventory_type: isNew ? 'neuf' : 'occasion',
        description: description,
        score: scoreNum,
        score_normalized: scoreNormalized,
        nb_reviews: nbReviews,
        source: source,
        source_url: `https://www.${slugify(brandData.make)}.ma/modeles/${modelFamily}`,
        seller_name: isNew ? `${brandData.make} Maroc (${city})` : `Concessionnaire ${city}`,
        seller_phone: '+212 5 22 ' + Math.floor(100000 + Math.random() * 900000),
        whatsapp_number: '+212 6 ' + Math.floor(10000000 + Math.random() * 90000000),
        image_url: imageUrl,
        photos: photos,
        delivery_delay: isNew ? 'Disponible immédiatement en concession ou 2 semaines' : 'Livraison en 48h partout au Maroc',
        metadata: {
          garantie: isNew ? '3 à 7 ans constructeur Maroc' : '12 mois pièces et main d\'œuvre',
          vendeur_certifie: true,
          reputation_score: scoreNormalized
        },
        created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 86400000)).toISOString(),
        updated_at: new Date().toISOString()
      };

      allVehicles.push(vehicle);

      const reviewsPerCar = Math.floor(Math.random() * 4) + 2;
      for (let r = 0; r < reviewsPerCar; r++) {
        const tmpl = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)];
        const isDarija = Math.random() > 0.7;
        const author = REVIEW_AUTHORS[Math.floor(Math.random() * REVIEW_AUTHORS.length)];
        allReviews.push({
          id: uuidv4(),
          vehicle_id: vehicleId,
          text: isDarija ? tmpl.textAr : tmpl.textFr,
          sentiment: tmpl.sent,
          category: tmpl.cat,
          rating: tmpl.rating,
          source: isNew ? 'Concessionnaire officiel Maroc' : 'Avis vérifié',
          author_name: author,
          language: isDarija ? 'darija' : 'fr',
          created_at: new Date(Date.now() - Math.floor(Math.random() * 180 * 86400000)).toISOString()
        });
      }

      count++;
    }
  }
}

console.log(`Generated ${allVehicles.length} vehicles and ${allReviews.length} reviews.`);

const dbDir = path.join(__dirname, '..', 'packages', 'database');
const webDataDir = path.join(__dirname, '..', 'apps', 'web', 'src', 'lib', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(webDataDir)) fs.mkdirSync(webDataDir, { recursive: true });

const payload = JSON.stringify({
  vehicles: allVehicles,
  reviews: allReviews
}, null, 2);

fs.writeFileSync(path.join(dbDir, 'seed-data.json'), payload, 'utf8');
fs.writeFileSync(path.join(webDataDir, 'seed-data.json'), payload, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'real-cars.json'), JSON.stringify(allVehicles, null, 2), 'utf8');

console.log('Writing seed.sql for PostgreSQL...');
let sqlContent = '-- Thiqti PostgreSQL Seed Data\n-- ' + allVehicles.length + ' vehicles\n\nBEGIN;\n\n';

for (const v of allVehicles) {
  const escStr = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
  const escJson = (obj) => `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
  
  sqlContent += `INSERT INTO vehicles (
    id, slug, name, sub, make, model, model_family, fuel, body_type, transmission,
    year, price_mad, price_display, km, city, color, places, engine_power_ch,
    consumption_l100km, co2_gkm, acceleration_0_100, trunk_liters, inventory_type,
    description, score, score_normalized, nb_reviews, source, source_url, seller_name,
    seller_phone, whatsapp_number, image_url, photos, delivery_delay, metadata
  ) VALUES (
    '${v.id}', ${escStr(v.slug)}, ${escStr(v.name)}, ${escStr(v.sub)}, ${escStr(v.make)}, ${escStr(v.model)}, ${escStr(v.model_family)}, ${escStr(v.fuel)}, ${escStr(v.body_type)}, ${escStr(v.transmission)},
    ${v.year}, ${v.price_mad}, ${escStr(v.price_display)}, ${v.km}, ${escStr(v.city)}, ${escStr(v.color)}, ${v.places}, ${v.engine_power_ch || 'NULL'},
    ${v.consumption_l100km || 'NULL'}, ${v.co2_gkm || 'NULL'}, ${v.acceleration_0_100 || 'NULL'}, ${v.trunk_liters || 'NULL'}, ${escStr(v.inventory_type)},
    ${escStr(v.description)}, ${v.score}, ${v.score_normalized}, ${v.nb_reviews}, ${escStr(v.source)}, ${escStr(v.source_url)}, ${escStr(v.seller_name)},
    ${escStr(v.seller_phone)}, ${escStr(v.whatsapp_number)}, ${escStr(v.image_url)}, ${escJson(v.photos)}, ${escStr(v.delivery_delay)}, ${escJson(v.metadata)}
  ) ON CONFLICT (slug) DO UPDATE SET price_mad = EXCLUDED.price_mad, updated_at = NOW();\n`;
}

for (const r of allReviews.slice(0, 1000)) {
  const escStr = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
  sqlContent += `INSERT INTO reviews (id, vehicle_id, text, sentiment, category, rating, source, author_name, language, created_at)
    VALUES ('${r.id}', '${r.vehicle_id}', ${escStr(r.text)}, ${escStr(r.sentiment)}, ${escStr(r.category)}, ${r.rating}, ${escStr(r.source)}, ${escStr(r.author_name)}, ${escStr(r.language)}, '${r.created_at}');\n`;
}

sqlContent += '\nCOMMIT;\n';

fs.writeFileSync(path.join(dbDir, 'seed.sql'), sqlContent, 'utf8');
console.log('Seed files created successfully!');
