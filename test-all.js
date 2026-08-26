/* Test complet post-corrections : 3D, images, comparateur, chat, premium (http + file://) */
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:8080';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  /* ============ A. SINGLE.HTML sur http ============ */
  {
    console.log('\n== A. single.html (http://localhost:8080) ==');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(BASE + '/single.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1500);

    // A1: pas de loremflickr restant
    const lorem = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter(i => /loremflickr/.test(i.src)).length);
    ok('A1 aucune image loremflickr', lorem === 0, lorem + ' restantes');

    // A2: imagin.studio utilisé
    const imagin = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter(i => /imagin\.studio/.test(i.src)).length);
    ok('A2 images imagin.studio présentes', imagin > 0, imagin + ' imgs');

    // A3: canvas 3D présent dans le hero
    await page.waitForSelector('.car3d-canvas', { timeout: 10000 }).catch(() => {});
    const has3d = await page.evaluate(() => !!document.querySelector('.car3d-canvas'));
    ok('A3 canvas WebGL hero', has3d);

    // A4: GLB chargé → classe car3d-on + SVG caché
    await page.waitForFunction(() => document.querySelector('.hero-car')?.classList.contains('car3d-on'), null, { timeout: 20000 })
      .catch(() => {});
    const glbOk = await page.evaluate(() => ({
      on: document.querySelector('.hero-car')?.classList.contains('car3d-on'),
      svgHidden: !document.querySelector('.hero-car .car-3d-svg')
        || getComputedStyle(document.querySelector('.hero-car .car-3d-svg')).display === 'none'
    }));
    ok('A4 modèle GLB chargé', glbOk.on === true, JSON.stringify(glbOk));

    // A5: recherche → résultats (flux réel quickSearch)
    await page.evaluate(() => quickSearch('SUV'));
    await page.waitForFunction(() => window._allResults && _allResults.length > 0, null, { timeout: 10000 })
      .catch(() => {});
    const results = await page.evaluate(() => ({
      n: (_allResults || []).length,
      cards: document.querySelectorAll('.results-list .card').length,
      visible: !!document.querySelector('.results-list')?.offsetParent
        || document.getElementById('page-results').style.display !== 'none'
    }));
    ok('A5 page résultats + cartes', results.n > 0 && results.cards > 0,
      results.n + ' résultats, ' + results.cards + ' cartes rendues');

    // A6: images résultats chargées
    let imgStat = { total: 0, loaded: 0 };
    for (let attempt = 0; attempt < 10; attempt++) {
      await page.waitForTimeout(1500);
      imgStat = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('.results-list img.car-img')];
        return { total: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth > 1).length };
      });
      if (imgStat.total > 0 && imgStat.loaded >= imgStat.total) break;
    }
    ok('A6 images résultats chargées', imgStat.total > 0 && imgStat.loaded / imgStat.total >= 0.9,
      imgStat.loaded + '/' + imgStat.total);

    // A7: bouton comparer présent sur les cartes dynamiques
    const cmpBtns = await page.evaluate(() => document.querySelectorAll('.results-list .card-cmp').length);
    ok('A7 boutons Comparer', cmpBtns > 0, cmpBtns + ' boutons');

    // A8: clic comparer → tableau de comparaison ≥2 véhicules
    await page.evaluate(() => {
      const b = document.querySelector('.results-list .card-cmp');
      if (b) b.click();
    });
    await page.waitForTimeout(1200);
    const cmp = await page.evaluate(() => {
      const el = document.getElementById('compareContent');
      return {
        cols: el ? el.querySelectorAll('table.cmp-tbl thead th').length : 0,
        hasTitle: el ? /Comparaison/i.test(el.textContent) : false
      };
    });
    ok('A8 comparaison affichée', cmp.cols >= 3 && cmp.hasTitle,
      cmp.cols + ' colonnes');

    // A9: favoris
    await page.evaluate(() => showPage('results'));
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const f = document.querySelector('.results-list .card-fav');
      if (f) f.click();
    });
    await page.waitForTimeout(600);
    const favN = await page.evaluate(() => _favIds.length);
    ok('A9 ajout favori', favN >= 1, favN + ' fav(s)');

    // A10: chat — envoi message + réponse bot
    await page.evaluate(() => showPage('assistant'));
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const inp = document.getElementById('chatInput');
      if (!inp) throw new Error('chatInput absent');
      inp.value = 'je cherche une citadine essence pas chere';
      sendMsg();
    });
    await page.waitForTimeout(4500);
    const chat = await page.evaluate(() => ({
      rows: document.querySelectorAll('.ast-row').length,
      bots: document.querySelectorAll('.ast-row.bot .ast-bub').length
    }));
    ok('A10 assistant répond', chat.bots >= 1, chat.rows + ' rangées, ' + chat.bots + ' réponses bot');

    // A11: détail véhicule
    await page.evaluate(() => showPage('home'));
    await page.waitForTimeout(400);
    await page.evaluate(() => showVehicle(CARS[0].id));
    await page.waitForTimeout(900);
    const vh = await page.evaluate(() => document.getElementById('page-vehicle').style.display !== 'none');
    ok('A11 fiche véhicule', vh);

    // A12: erreurs console hors ressources externes
    const realErrors = errors.filter(e =>
      !/net::|ERR_|Failed to load resource|loremflickr|auto24|imagin/i.test(e));
    ok('A12 zéro erreur JS', realErrors.length === 0, realErrors.slice(0, 3).join(' | ') || 'clean');
    await page.close();
  }

  /* ============ B. PREMIUM sur http ============ */
  {
    console.log('\n== B. thiqti-premium.html (http) ==');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => errors.push('premium http pageerror: ' + e.message));
    await page.goto(BASE + '/thiqti-premium.html', { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => document.getElementById('loaderStage')?.classList.contains('hidden'),
      null, { timeout: 25000 }).catch(() => {});
    const st = await page.evaluate(() => ({
      hidden: document.getElementById('loaderStage')?.classList.contains('hidden'),
      canvas: !!document.querySelector('#canvas-container canvas')
    }));
    ok('B1 voiture 3D premium (http)', st.hidden && st.canvas, JSON.stringify(st));
    await page.screenshot({ path: 'shot-premium-http.png' });
    await page.close();
  }

  /* ============ C. PREMIUM en file:// (scénario double-clic utilisateur) ============ */
  {
    console.log('\n== C. thiqti-premium.html (file:// double-clic) ==');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => errors.push('premium file pageerror: ' + e.message));
    await page.goto('file:///' + path.resolve('thiqti-premium.html').replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => document.getElementById('loaderStage')?.classList.contains('hidden'),
      null, { timeout: 25000 }).catch(() => {});
    const st = await page.evaluate(() => ({
      hidden: document.getElementById('loaderStage')?.classList.contains('hidden'),
      canvas: !!document.querySelector('#canvas-container canvas'),
      three: typeof THREE !== 'undefined'
    }));
    ok('C1 voiture 3D premium (file://)', st.hidden && st.canvas, JSON.stringify(st));
    await page.screenshot({ path: 'shot-premium-file.png' });
    await page.close();
  }

  /* ============ D. SINGLE en file:// (dégradation propre attendue) ============ */
  {
    console.log('\n== D. single.html (file://) ==');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('file:///' + path.resolve('single.html').replace(/\\/g, '/'), { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2500);
    const st = await page.evaluate(() => ({
      three: typeof THREE !== 'undefined',
      cards: document.querySelectorAll('.card').length,
      searchFn: typeof doSearch === 'function'
    }));
    ok('D1 single file:// charge (UI + Three)', st.three && st.cards > 0 && st.searchFn, JSON.stringify(st));
    await page.close();
  }

  await browser.close();

  console.log('\n========================================');
  console.log('RÉSULTAT: ' + pass + ' PASS / ' + fail + ' FAIL');
  if (errors.length) console.log('Erreurs console (filtrées): ' + errors.slice(0, 5).join('\n'));
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('ERREUR TESTS:', e); process.exit(2); });
