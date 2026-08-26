const {
  searchVehiclesService,
  getVehicleDetailService,
  getVehicleReputationService,
  handleChatService,
  getCompareService,
  getHomeDataService,
  syncFavoritesService,
  getStatsService,
  logSearchService,
  parseNLPQuery
} = require('../apps/web/src/lib/backend-db.ts');

async function runTests() {
  console.log('========================================');
  console.log('🚀 TEST SUITE — THIQTI BACKEND REST API');
  console.log('========================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
    }
  }

  // 1. NLP Parser Tests
  console.log('--- 1. NLP Parser Tests (French & Darija) ---');
  const nlp1 = parseNLPQuery('SUV hybride 350000 DH');
  assert(nlp1.extractedCriteria.body === 'SUV', 'NLP extracts SUV body');
  assert(nlp1.extractedCriteria.fuel === 'Hybride', 'NLP extracts Hybride fuel');
  assert(nlp1.extractedCriteria.budget_max === 350000, 'NLP extracts 350000 DH budget');

  const nlp2 = parseNLPQuery('bghit tomobil mazot dial famiya');
  assert(nlp2.language === 'darija', 'NLP detects Darija language');
  assert(nlp2.extractedCriteria.fuel === 'Diesel', 'NLP translates mazot to Diesel');
  assert(nlp2.extractedCriteria.body === 'Monospace', 'NLP maps famiya to Monospace');

  const nlp3 = parseNLPQuery('Toyota neuve automatique Casablanca');
  assert(nlp3.extractedCriteria.brand === 'Toyota', 'NLP extracts Toyota brand');
  assert(nlp3.extractedCriteria.inventory === 'neuf', 'NLP extracts neuf inventory');
  assert(nlp3.extractedCriteria.transmission === 'Automatique', 'NLP extracts Automatique');
  assert(nlp3.extractedCriteria.city === 'Casablanca', 'NLP extracts Casablanca city');

  // 2. Search & Filter Endpoint Test
  console.log('\n--- 2. GET /api/vehicles Service ---');
  const search1 = await searchVehiclesService({ q: 'SUV hybride 350000 DH', limit: 10 });
  assert(search1.vehicles.length > 0, `Search returns ${search1.vehicles.length} vehicles`);
  assert(search1.total > 0, `Total vehicles counted: ${search1.total}`);
  assert(search1.totalPages >= 1, `Total pages: ${search1.totalPages}`);
  assert(search1.filters.makes.length > 0, 'Facets for makes generated');
  assert(search1.filters.fuels.length > 0, 'Facets for fuels generated');
  assert(search1.filters.bodyTypes.length > 0, 'Facets for body types generated');
  assert(search1.filters.priceRange.min > 0, `Price range min: ${search1.filters.priceRange.min} DH`);

  // 3. Detail Endpoint Test
  console.log('\n--- 3. GET /api/vehicles/:id Service ---');
  const firstCar = search1.vehicles[0];
  const detail = await getVehicleDetailService(firstCar.id);
  assert(detail !== null, 'Vehicle detail retrieved');
  assert(detail.reviews.length >= 0, `Reviews retrieved: ${detail.reviews.length}`);
  assert(Array.isArray(detail.pros) && detail.pros.length > 0, 'Pros generated');
  assert(Array.isArray(detail.cons) && detail.cons.length > 0, 'Cons generated');
  assert(typeof detail.verdict === 'string', 'AI verdict generated');
  assert(detail.similar.length > 0, `Similar vehicles: ${detail.similar.length}`);
  assert(detail.priceStats.min > 0, `Price stats min: ${detail.priceStats.min}`);

  // 4. Reputation Endpoint Test
  console.log('\n--- 4. GET /api/vehicles/:id/reputation Service ---');
  const rep = await getVehicleReputationService(firstCar.id);
  assert(rep !== null, 'Reputation score retrieved');
  assert(rep.categories.length === 7, '7 categories evaluated (Confort, Consommation, Fiabilité, Prix, Design, Équipements, Sûreté)');
  assert(rep.categories[0].score > 0, `Category score: ${rep.categories[0].score}`);
  assert(Array.isArray(rep.excerpts), 'Excerpts available');

  // 5. Conversational Assistant Test
  console.log('\n--- 5. POST /api/chat Service ---');
  const chat1 = await handleChatService({
    message: 'bghit tomobil mazot dial famiya',
    sessionId: 'test_session_123'
  });
  assert(chat1.vehicles.length > 0, `Chat recommendations: ${chat1.vehicles.length} cars`);
  assert(chat1.quickReplies.length > 0, 'Quick replies provided');
  assert(chat1.advisorState.progress > 0, `Advisor progress: ${chat1.advisorState.progress}%`);
  assert(typeof chat1.reply === 'string', 'Bot reply generated in Darija');

  // 6. Compare Endpoint Test
  console.log('\n--- 6. GET /api/compare Service ---');
  const compareCars = search1.vehicles.slice(0, 3).map(v => v.id);
  const cmp = await getCompareService(compareCars);
  assert(cmp.vehicles.length === 3, 'Compare returns 3 vehicles');
  assert(cmp.topScoreId !== undefined, `Top score vehicle identified: ${cmp.topScoreId}`);
  assert(typeof cmp.summary === 'string', 'AI comparison summary generated');

  // 7. Home Data Endpoint Test
  console.log('\n--- 7. GET /api/home Service ---');
  const homeData = await getHomeDataService();
  assert(homeData.stats.totalVehicles >= 1700, `Total vehicles in catalog: ${homeData.stats.totalVehicles}`);
  assert(homeData.brands.length >= 10, `Brands loaded: ${homeData.brands.length}`);
  assert(homeData.categories.length === 4, '4 featured categories with avg price');
  assert(homeData.featured.length === 8, '8 featured vehicles');
  assert(homeData.newArrivals.length === 8, '8 new arrival vehicles');

  // 8. Favorites Endpoint Test
  console.log('\n--- 8. /api/favorites Service ---');
  const favRes = await syncFavoritesService('test_session_123', [firstCar.id]);
  assert(favRes.count === 1, 'Favorite added');
  assert(favRes.favorites[0].id === firstCar.id, 'Favorite ID matches');

  // 9. Stats Endpoint Test
  console.log('\n--- 9. GET /api/stats Service ---');
  const stats = await getStatsService();
  assert(stats.avgPrice > 100000, `Average market price: ${stats.avgPrice} DH`);
  assert(stats.totalVehicles >= 1700, `Total catalog count: ${stats.totalVehicles}`);

  // 10. Search Logging Test
  console.log('\n--- 10. POST /api/search/log Service ---');
  const logRes = await logSearchService({
    sessionId: 'test_session_123',
    query: 'SUV Casablanca',
    resultsCount: 45
  });
  assert(logRes.success === true, 'Search query successfully logged');

  console.log('\n========================================');
  console.log(`🎯 RESULTATS : ${passed} / ${total} TESTS REUSSIS !`);
  console.log('========================================');
}

runTests().catch(console.error);
