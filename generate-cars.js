// Generate 700+ car CARS array for single.html
const cities = ['Casablanca','Rabat','Marrakech','Tanger','Fès','Agadir','Meknès','Tétouan','El Jadida','Oujda','Kenitra','Taza'];
const fuels = {'Essence':'Essence','Diesel':'Diesel','Hybride':'Hybride','Électrique':'Electrique'};
const bodies = {'Citadine':'Citadine','Compacte':'Compacte','Berline':'Berline','SUV':'SUV','Crossover':'Crossover','Monospace':'Monospace','Pick-up':'Utilitaire','Utilitaire':'Utilitaire'};

const officialCars = [
  {brand:'Dacia',model:'Sandero',price:149900,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Dacia',model:'Sandero Stepway',price:172900,fuel:'Essence',body:'Crossover',trans:'Manuelle'},
  {brand:'Dacia',model:'Logan',price:169900,fuel:'Essence',body:'Berline',trans:'Manuelle'},
  {brand:'Dacia',model:'Logan CVT',price:189900,fuel:'Essence',body:'Berline',trans:'Automatique'},
  {brand:'Dacia',model:'Duster',price:219900,fuel:'Essence',body:'SUV',trans:'Manuelle'},
  {brand:'Dacia',model:'Duster AT',price:249900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Dacia',model:'Duster Diesel',price:239900,fuel:'Diesel',body:'SUV',trans:'Manuelle'},
  {brand:'Dacia',model:'Jogger',price:199900,fuel:'Essence',body:'Monospace',trans:'Manuelle'},
  {brand:'Dacia',model:'Jogger Hybrid',price:249900,fuel:'Hybride',body:'Monospace',trans:'Automatique'},
  {brand:'Dacia',model:'Spring',price:139900,fuel:'Electrique',body:'Citadine',trans:'Automatique'},
  {brand:'Renault',model:'Clio',price:215000,fuel:'Essence',body:'Citadine',trans:'Automatique'},
  {brand:'Renault',model:'Clio E-Tech',price:249000,fuel:'Hybride',body:'Citadine',trans:'Automatique'},
  {brand:'Renault',model:'Megane E-TECH',price:319000,fuel:'Electrique',body:'Berline',trans:'Automatique'},
  {brand:'Renault',model:'Austral',price:349000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Renault',model:'Kardian',price:239000,fuel:'Diesel',body:'Crossover',trans:'Automatique'},
  {brand:'Renault',model:'Duster',price:199000,fuel:'Diesel',body:'SUV',trans:'Manuelle'},
  {brand:'Renault',model:'Symbol',price:129000,fuel:'Essence',body:'Berline',trans:'Manuelle'},
  {brand:'Renault',model:'Captur',price:229000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Renault',model:'Koleos',price:379000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Peugeot',model:'208',price:205000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Peugeot',model:'208 GT',price:245000,fuel:'Essence',body:'Citadine',trans:'Automatique'},
  {brand:'Peugeot',model:'2008',price:265000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Peugeot',model:'308',price:295000,fuel:'Diesel',body:'Compacte',trans:'Automatique'},
  {brand:'Peugeot',model:'3008',price:375000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Peugeot',model:'408',price:345000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Peugeot',model:'508',price:395000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'Peugeot',model:'Rifter',price:285000,fuel:'Diesel',body:'Monospace',trans:'Manuelle'},
  {brand:'Toyota',model:'Yaris',price:215000,fuel:'Hybride',body:'Citadine',trans:'Automatique'},
  {brand:'Toyota',model:'Yaris Cross',price:285000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Toyota',model:'Corolla',price:289000,fuel:'Hybride',body:'Berline',trans:'Automatique'},
  {brand:'Toyota',model:'C-HR',price:295000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Toyota',model:'RAV4',price:389000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Toyota',model:'Hilux',price:345000,fuel:'Diesel',body:'Utilitaire',trans:'Manuelle'},
  {brand:'Toyota',model:'Land Cruiser',price:599000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Toyota',model:'Proace',price:389000,fuel:'Diesel',body:'Utilitaire',trans:'Automatique'},
  {brand:'Hyundai',model:'i10',price:149000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Hyundai',model:'i20',price:189000,fuel:'Essence',body:'Compacte',trans:'Manuelle'},
  {brand:'Hyundai',model:'Bayon',price:199000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Hyundai',model:'Kona',price:275000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Hyundai',model:'Tucson',price:359900,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Hyundai',model:'Ioniq 5',price:499000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'Hyundai',model:'Santa Fe',price:449000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Hyundai',model:'Ioniq 6',price:479000,fuel:'Electrique',body:'Berline',trans:'Automatique'},
  {brand:'Kia',model:'Picanto',price:138000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Kia',model:'Stonic',price:215000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Kia',model:'Niro',price:309000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Kia',model:'Sportage',price:345000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Kia',model:'Ceed',price:259000,fuel:'Essence',body:'Compacte',trans:'Automatique'},
  {brand:'Kia',model:'EV6',price:549000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'Kia',model:'Sorento',price:465000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Kia',model:'Rio',price:169000,fuel:'Essence',body:'Berline',trans:'Automatique'},
  {brand:'Volkswagen',model:'Polo',price:205000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Volkswagen',model:'Golf',price:340000,fuel:'Essence',body:'Compacte',trans:'Automatique'},
  {brand:'Volkswagen',model:'T-Cross',price:235000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Volkswagen',model:'T-Roc',price:315000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Volkswagen',model:'Tiguan',price:395000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Volkswagen',model:'ID.4',price:525000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'Volkswagen',model:'Passat',price:420000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'Ford',model:'Puma',price:239000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Ford',model:'Kuga',price:299000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Ford',model:'Ranger',price:399000,fuel:'Diesel',body:'Utilitaire',trans:'Automatique'},
  {brand:'Ford',model:'Mustang Mach-E',price:599000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'Ford',model:'Explorer',price:499000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Ford',model:'Transit',price:349000,fuel:'Diesel',body:'Utilitaire',trans:'Automatique'},
  {brand:'Nissan',model:'Juke',price:235000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Nissan',model:'Qashqai',price:310000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Nissan',model:'X-Trail',price:375000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Nissan',model:'Leaf',price:399000,fuel:'Electrique',body:'Berline',trans:'Automatique'},
  {brand:'Nissan',model:'Micra',price:179000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Fiat',model:'500',price:185000,fuel:'Essence',body:'Citadine',trans:'Automatique'},
  {brand:'Fiat',model:'Tipo',price:195000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'Fiat',model:'500e',price:329000,fuel:'Electrique',body:'Citadine',trans:'Automatique'},
  {brand:'Fiat',model:'Panda',price:149000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Citroën',model:'C3',price:165000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Citroën',model:'C3 Aircross',price:199000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Citroën',model:'C4',price:265000,fuel:'Essence',body:'Crossover',trans:'Automatique'},
  {brand:'Citroën',model:'C5 Aircross',price:310000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Citroën',model:'ë-C4 X',price:359000,fuel:'Electrique',body:'Berline',trans:'Automatique'},
  {brand:'Opel',model:'Corsa',price:175000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Opel',model:'Mokka',price:255000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Opel',model:'Crossland',price:225000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Opel',model:'Grandland',price:335000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Opel',model:'Astra',price:285000,fuel:'Essence',body:'Compacte',trans:'Automatique'},
  {brand:'Honda',model:'Jazz',price:225000,fuel:'Hybride',body:'Citadine',trans:'Automatique'},
  {brand:'Honda',model:'Civic',price:345000,fuel:'Hybride',body:'Compacte',trans:'Automatique'},
  {brand:'Honda',model:'HR-V',price:295000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Honda',model:'CR-V',price:425000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Honda',model:'ZR-V',price:365000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'BMW',model:'Série 1',price:395000,fuel:'Essence',body:'Compacte',trans:'Automatique'},
  {brand:'BMW',model:'Série 3',price:545000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'BMW',model:'X1',price:495000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'BMW',model:'X3',price:620000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'BMW',model:'iX1',price:565000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'BMW',model:'X5',price:895000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'BMW',model:'Série 5',price:695000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'Mercedes',model:'Classe A',price:420000,fuel:'Essence',body:'Compacte',trans:'Automatique'},
  {brand:'Mercedes',model:'Classe C',price:595000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'Mercedes',model:'GLA',price:475000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Mercedes',model:'GLB',price:520000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Mercedes',model:'GLC',price:650000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Mercedes',model:'EQA',price:545000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'Mercedes',model:'EQB',price:595000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'BYD',model:'ATTO 3',price:355900,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'BYD',model:'Seal U',price:359900,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'BYD',model:'Dolphin',price:269900,fuel:'Electrique',body:'Citadine',trans:'Automatique'},
  {brand:'BYD',model:'Seal',price:409900,fuel:'Electrique',body:'Berline',trans:'Automatique'},
  {brand:'MG',model:'HS',price:269000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'MG',model:'ZS EV',price:299000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
  {brand:'MG',model:'MG5',price:189000,fuel:'Essence',body:'Berline',trans:'Automatique'},
  {brand:'MG',model:'MG4',price:269900,fuel:'Electrique',body:'Compacte',trans:'Automatique'},
  {brand:'Suzuki',model:'Vitara',price:235000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Suzuki',model:'Swift',price:165000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Suzuki',model:'Jimny',price:219000,fuel:'Essence',body:'SUV',trans:'Manuelle'},
  {brand:'Suzuki',model:'S-Cross',price:249000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Changan',model:'CS35 Plus',price:179900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Changan',model:'CS55 Plus',price:219900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Changan',model:'UNI-T',price:269900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Chery',model:'Tiggo 4',price:169900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Chery',model:'Tiggo 7',price:219900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Chery',model:'Tiggo 8',price:269900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'DFSK',model:'E5',price:255000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'DFSK',model:'Glory 580',price:209900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'JAC',model:'S2',price:139900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'JAC',model:'S3',price:165000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Geely',model:'Coolray',price:199900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Geely',model:'Emgrand',price:169900,fuel:'Essence',body:'Berline',trans:'Automatique'},
  {brand:'Haval',model:'Jolion',price:199900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Haval',model:'H6',price:299900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Omoda',model:'C5',price:219900,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Volvo',model:'XC40',price:420000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Volvo',model:'XC60',price:565000,fuel:'Hybride',body:'SUV',trans:'Automatique'},
  {brand:'Mazda',model:'CX-30',price:285000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Mazda',model:'CX-5',price:365000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Jeep',model:'Renegade',price:295000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Jeep',model:'Compass',price:349000,fuel:'Diesel',body:'SUV',trans:'Automatique'},
  {brand:'Škoda',model:'Octavia',price:285000,fuel:'Diesel',body:'Berline',trans:'Automatique'},
  {brand:'Seat',model:'Leon',price:280000,fuel:'Essence',body:'Compacte',trans:'Automatique'},
  {brand:'Seat',model:'Ibiza',price:185000,fuel:'Essence',body:'Citadine',trans:'Manuelle'},
  {brand:'Seat',model:'Arona',price:225000,fuel:'Essence',body:'SUV',trans:'Automatique'},
  {brand:'Tesla',model:'Model 3',price:525000,fuel:'Electrique',body:'Berline',trans:'Automatique'},
  {brand:'Tesla',model:'Model Y',price:595000,fuel:'Electrique',body:'SUV',trans:'Automatique'},
];

// Used car depreciation model
function depreciation(price, year, km) {
  const age = 2026 - year;
  let factor = 1;
  factor *= Math.pow(0.82, age); // ~18% per year
  factor *= 1 - (km / 300000) * 0.15; // ~15% at 300k km
  if (km > 100000) factor *= 0.9;
  if (km > 150000) factor *= 0.85;
  return Math.round(price * factor / 1000) * 1000;
}

function fmt(n) { return n.toLocaleString('fr-FR') + ' DH'; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

let idCounter = 0;
function makeId(brand, model, year, km, price) {
  idCounter++;
  return 'car_' + idCounter;
}

let allCars = [];
let seen = new Set();

// Add all new official cars
officialCars.forEach(c => {
  const key = `${c.brand}_${c.model}_2025`;
  if (seen.has(key)) return;
  seen.add(key);
  const fuelKey = fuels[c.fuel] || c.fuel;
  const bodyKey = bodies[c.body] || c.body;
  allCars.push({
    id: makeId(c.brand, c.model, 2025, 0, c.price),
    name: c.brand + ' ' + c.model + ' Neuf',
    sub: '2025 - ' + c.trans,
    price: fmt(c.price),
    score: (8 + Math.random() * 1.5).toFixed(1),
    nb: randInt(50, 400) + ' avis',
    g: '#10B981',
    g1: '#ECFDF5',
    g2: '#F0FDF4',
    fill: '#059669',
    make: c.brand,
    model: c.model,
    fuel: fuelKey,
    body: bodyKey,
    img: c.brand.toLowerCase() + ',' + c.model.toLowerCase().replace(/\s+/g, '-'),
    desc: c.brand + ' ' + c.model + ' neuf au prix officiel, garantie constructeur.'
  });
});

// Generate used variants for each official car
officialCars.forEach(c => {
  const fuelKey = fuels[c.fuel] || c.fuel;
  const bodyKey = bodies[c.body] || c.body;
  // Skip EVs for used variants (less common in used market)
  const years = c.fuel === 'Electrique'
    ? [2023, 2024]
    : [2019, 2020, 2021, 2022, 2023, 2024];
  
  years.forEach(year => {
    const nVariants = randInt(1, 3);
    for (let v = 0; v < nVariants; v++) {
      const km = randInt(5000, 120000);
      const usedPrice = depreciation(c.price, year, km);
      if (usedPrice < 30000) continue;
      const city = pick(cities);
      const key = `${c.brand}_${c.model}_${year}_${km}_${usedPrice}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      const age = 2026 - year;
      let score = 72;
      if (age <= 1) score += 15;
      else if (age <= 2) score += 10;
      else if (age <= 3) score += 5;
      else if (age > 5) score -= 10;
      if (km < 30000) score += 10;
      else if (km < 60000) score += 5;
      else if (km > 120000) score -= 10;
      score = Math.max(55, Math.min(98, score));

      const g = score >= 80 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
      const g1 = score >= 80 ? '#ECFDF5' : score >= 70 ? '#FEF3C7' : '#FEF2F2';
      const g2 = score >= 80 ? '#F0FDF4' : score >= 70 ? '#FFFBEB' : '#FDF6F6';
      const fill = score >= 80 ? '#059669' : score >= 70 ? '#D97706' : '#DC2626';

      const occOrNeuf = year >= 2024 ? 'Bon état' : year >= 2022 ? 'Très bon état' : 'Bon état';
      allCars.push({
        id: makeId(c.brand, c.model, year, km, usedPrice),
        name: c.brand + ' ' + c.model,
        sub: year + ' - ' + c.trans + ' - ' + occOrNeuf,
        price: fmt(usedPrice),
        score: score.toFixed(1),
        nb: randInt(20, 350) + ' avis',
        g: g,
        g1: g1,
        g2: g2,
        fill: fill,
        make: c.brand,
        model: c.model,
        fuel: fuelKey,
        body: bodyKey,
        img: c.brand.toLowerCase() + ',' + c.model.toLowerCase().replace(/\s+/g, '-') + ',occasion',
        desc: c.brand + ' ' + c.model + ' d\'occasion ' + year + ', ' + km.toLocaleString('fr-FR') + ' km, ' + city + '.'
      });
    }
  });
});

// Generate some common popular occasion cars that are very common in Morocco
const popularUsed = [
  {brand:'Renault',model:'Clio IV',year:2018,price:85000,fuel:'Essence',body:'Citadine'},
  {brand:'Renault',model:'Clio IV',year:2019,price:95000,fuel:'Essence',body:'Citadine'},
  {brand:'Renault',model:'Clio III',year:2015,price:55000,fuel:'Essence',body:'Citadine'},
  {brand:'Renault',model:'Symbol',year:2017,price:62000,fuel:'Essence',body:'Berline'},
  {brand:'Renault',model:'Symbol',year:2019,price:79000,fuel:'Essence',body:'Berline'},
  {brand:'Renault',model:'Logan',year:2018,price:72000,fuel:'Essence',body:'Berline'},
  {brand:'Renault',model:'Logan',year:2019,price:85000,fuel:'Diesel',body:'Berline'},
  {brand:'Renault',model:'Duster',year:2019,price:115000,fuel:'Diesel',body:'SUV'},
  {brand:'Renault',model:'Megane III',year:2017,price:78000,fuel:'Diesel',body:'Compacte'},
  {brand:'Renault',model:'Megane IV',year:2019,price:120000,fuel:'Essence',body:'Compacte'},
  {brand:'Peugeot',model:'206',year:2015,price:42000,fuel:'Essence',body:'Citadine'},
  {brand:'Peugeot',model:'206 Plus',year:2018,price:65000,fuel:'Essence',body:'Citadine'},
  {brand:'Peugeot',model:'207',year:2016,price:52000,fuel:'Essence',body:'Citadine'},
  {brand:'Peugeot',model:'208',year:2019,price:105000,fuel:'Essence',body:'Citadine'},
  {brand:'Peugeot',model:'308',year:2018,price:110000,fuel:'Diesel',body:'Compacte'},
  {brand:'Peugeot',model:'301',year:2019,price:85000,fuel:'Diesel',body:'Berline'},
  {brand:'Peugeot',model:'2008',year:2020,price:135000,fuel:'Essence',body:'SUV'},
  {brand:'Dacia',model:'Logan MCV',year:2018,price:62000,fuel:'Diesel',body:'Break'},
  {brand:'Dacia',model:'Logan MCV',year:2020,price:85000,fuel:'Diesel',body:'Break'},
  {brand:'Dacia',model:'Duster',year:2018,price:95000,fuel:'Diesel',body:'SUV'},
  {brand:'Dacia',model:'Duster',year:2020,price:125000,fuel:'Diesel',body:'SUV'},
  {brand:'Dacia',model:'Sandero',year:2017,price:52000,fuel:'Essence',body:'Citadine'},
  {brand:'Dacia',model:'Sandero',year:2019,price:72000,fuel:'Essence',body:'Citadine'},
  {brand:'Volkswagen',model:'Golf VI',year:2015,price:78000,fuel:'Diesel',body:'Compacte'},
  {brand:'Volkswagen',model:'Polo',year:2018,price:105000,fuel:'Essence',body:'Citadine'},
  {brand:'Volkswagen',model:'Golf VII',year:2019,price:165000,fuel:'Diesel',body:'Compacte'},
  {brand:'Toyota',model:'Yaris',year:2018,price:95000,fuel:'Essence',body:'Citadine'},
  {brand:'Toyota',model:'Corolla',year:2019,price:155000,fuel:'Essence',body:'Berline'},
  {brand:'Hyundai',model:'i10',year:2018,price:55000,fuel:'Essence',body:'Citadine'},
  {brand:'Hyundai',model:'i20',year:2019,price:95000,fuel:'Essence',body:'Compacte'},
  {brand:'Hyundai',model:'Tucson',year:2019,price:175000,fuel:'Diesel',body:'SUV'},
  {brand:'Kia',model:'Picanto',year:2017,price:45000,fuel:'Essence',body:'Citadine'},
  {brand:'Kia',model:'Rio',year:2019,price:82000,fuel:'Essence',body:'Berline'},
  {brand:'Kia',model:'Sportage',year:2019,price:165000,fuel:'Diesel',body:'SUV'},
  {brand:'Ford',model:'Fiesta',year:2018,price:82000,fuel:'Essence',body:'Citadine'},
  {brand:'Ford',model:'Focus',year:2019,price:115000,fuel:'Diesel',body:'Compacte'},
  {brand:'Nissan',model:'Qashqai',year:2018,price:145000,fuel:'Diesel',body:'SUV'},
  {brand:'Fiat',model:'500',year:2018,price:95000,fuel:'Essence',body:'Citadine'},
  {brand:'Opel',model:'Corsa',year:2018,price:72000,fuel:'Essence',body:'Citadine'},
  {brand:'Citroën',model:'C3',year:2019,price:79000,fuel:'Essence',body:'Citadine'},
  {brand:'Seat',model:'Ibiza',year:2018,price:95000,fuel:'Essence',body:'Citadine'},
  {brand:'Seat',model:'Leon',year:2019,price:135000,fuel:'Diesel',body:'Compacte'},
  {brand:'BMW',model:'Série 3',year:2017,price:195000,fuel:'Diesel',body:'Berline'},
  {brand:'BMW',model:'X1',year:2018,price:245000,fuel:'Diesel',body:'SUV'},
  {brand:'Mercedes',model:'Classe A',year:2018,price:195000,fuel:'Essence',body:'Compacte'},
  {brand:'Mercedes',model:'Classe C',year:2017,price:265000,fuel:'Diesel',body:'Berline'},
  {brand:'Suzuki',model:'Swift',year:2019,price:72000,fuel:'Essence',body:'Citadine'},
  {brand:'Suzuki',model:'Vitara',year:2019,price:135000,fuel:'Essence',body:'SUV'},
  {brand:'Mazda',model:'CX-30',year:2020,price:185000,fuel:'Essence',body:'SUV'},
  {brand:'Mitsubishi',model:'ASX',year:2019,price:145000,fuel:'Diesel',body:'SUV'},
  {brand:'Mitsubishi',model:'Outlander',year:2018,price:195000,fuel:'Diesel',body:'SUV'},
  {brand:'Jeep',model:'Renegade',year:2019,price:175000,fuel:'Diesel',body:'SUV'},
];

popularUsed.forEach(c => {
  const fuelKey = fuels[c.fuel] || c.fuel;
  const bodyKey = bodies[c.body] || c.body;
  const km = randInt(15000, 120000);
  const city = pick(cities);
  const usedPrice = c.price;
  const key = `${c.brand}_${c.model}_${c.year}_${km}_${usedPrice}`;
  if (seen.has(key)) return;
  seen.add(key);

  let score = 72;
  const age = 2026 - c.year;
  if (age <= 1) score += 15;
  else if (age <= 2) score += 10;
  else if (age <= 3) score += 5;
  else if (age > 5) score -= 10;
  if (km < 30000) score += 10;
  else if (km < 60000) score += 5;
  else if (km > 120000) score -= 10;
  score = Math.max(55, Math.min(98, score));

  const g = score >= 80 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
  const g1 = score >= 80 ? '#ECFDF5' : score >= 70 ? '#FEF3C7' : '#FEF2F2';
  const g2 = score >= 80 ? '#F0FDF4' : score >= 70 ? '#FFFBEB' : '#FDF6F6';
  const fill = score >= 80 ? '#059669' : score >= 70 ? '#D97706' : '#DC2626';

  allCars.push({
    id: makeId(c.brand, c.model, c.year, km, usedPrice),
    name: c.brand + ' ' + c.model,
    sub: c.year + ' - ' + (c.year >= 2020 ? 'Bon état' : 'État correct'),
    price: fmt(usedPrice),
    score: score.toFixed(1),
    nb: randInt(15, 300) + ' avis',
    g: g,
    g1: g1,
    g2: g2,
    fill: fill,
    make: c.brand,
    model: c.model,
    fuel: fuelKey,
    body: bodyKey,
    img: c.brand.toLowerCase() + ',' + c.model.toLowerCase().replace(/\s+/g, '-') + ',occasion',
    desc: c.brand + ' ' + c.model + ' d\'occasion ' + c.year + ', ' + km.toLocaleString('fr-FR') + ' km, ' + city + '.'
  });
});

// Output as JS
function jsStr(s){return s.replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
let output = 'var CARS=[';
allCars.forEach((c, i) => {
  var o="{id:'"+jsStr(c.id)+"',name:'"+jsStr(c.name)+"',sub:'"+jsStr(c.sub)+"',price:'"+jsStr(c.price)+"',score:'"+jsStr(c.score)+"',nb:'"+jsStr(c.nb)+"',g:'"+c.g+"',g1:'"+c.g1+"',g2:'"+c.g2+"',fill:'"+c.fill+"',make:'"+jsStr(c.make)+"',model:'"+jsStr(c.model)+"',fuel:'"+c.fuel+"',body:'"+c.body+"',img:'"+jsStr(c.img)+"',desc:'"+jsStr(c.desc)+"'}";
  output += o;
  if (i < allCars.length - 1) output += ',\n';
});
output += '];\n';

const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.join(__dirname, 'cars-data.js'), output);
console.log('Generated ' + allCars.length + ' cars');
console.log('Brands: ' + [...new Set(allCars.map(c => c.make))].join(', '));
