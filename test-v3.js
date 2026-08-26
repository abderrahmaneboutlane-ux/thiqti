/* Tests v3 : refonte design + assistant conseiller */
const { chromium } = require('playwright');
const BASE = 'http://localhost:8080';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const browser = await chromium.launch();

  /* ===== A. HOME REDÉSIGNÉE ===== */
  {
    console.log('\n== A. Home redesignee ==');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + '/single.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);

    const home = await page.evaluate(() => ({
      topnav: !!document.querySelector('.topnav') && getComputedStyle(document.querySelector('.topnav')).display !== 'none',
      search: !!document.getElementById('searchInput'),
      brands: document.querySelectorAll('.brand-pill').length,
      cats: document.querySelectorAll('.cat-card').length,
      steps: document.querySelectorAll('.step-card').length,
      cta: !!document.querySelector('.cta-banner'),
      footer: !!document.querySelector('.site-footer'),
      hfloats: document.querySelectorAll('.hfloat').length,
      font: getComputedStyle(document.querySelector('h1')).fontFamily.includes('Space Grotesk')
    }));
    ok('A1 topnav desktop', home.topnav);
    ok('A2 barre recherche hero', home.search);
    ok('A3 sections pro', home.brands >= 8 && home.cats === 4 && home.steps === 3 && home.cta && home.footer,
      home.brands + ' marques, ' + home.cats + ' cats, ' + home.steps + ' etapes');
    ok('A4 cartes flottantes 3D', home.hfloats === 2);
    ok('A5 typographie Space Grotesk', home.font);

    // recherche hero fonctionnelle
    await page.evaluate(() => { document.getElementById('searchInput').value = 'SUV'; doSearch(); });
    await page.waitForFunction(() => window._allResults && _allResults.length > 0, null, { timeout: 10000 }).catch(() => {});
    const r = await page.evaluate(() => _allResults.length);
    ok('A6 recherche hero -> resultats', r > 0, r + ' resultats');

    // nav sync
    await page.evaluate(() => showPage('compare'));
    const navOn = await page.evaluate(() =>
      document.querySelector('.topnav-links .tnl[data-nav="compare"]')?.classList.contains('on'));
    ok('A7 topnav sync active', navOn === true);

    const realErrors = errors.filter(e => !/net::|Failed to load resource/i.test(e));
    ok('A8 zero erreur JS home', realErrors.length === 0, realErrors.slice(0, 2).join('|'));
    await page.close();
  }

  /* ===== B. ASSISTANT CONSEILLER — FLUX FRANCAIS ===== */
  {
    console.log('\n== B. Conseiller francais ==');
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + '/single.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => showPage('assistant'));
    await page.waitForSelector('#chatBody .ast-qr', { timeout: 12000 });

    async function say(txt) {
      await page.evaluate(t => { document.getElementById('chatInput').value = t; sendMsg(); }, txt);
      await page.waitForTimeout(500);
      await page.waitForFunction(() => !document.querySelector('#chatBody .ast-streaming') && !document.querySelector('#chatBody .ast-typing'),
        null, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(350);
    }

    // B1: bienvenue spec
    const w = await page.evaluate(() => ({
      hasWelcome: /Salut/.test(document.getElementById('chatBody').textContent),
      chips: [...document.querySelectorAll('#chatBody .ast-qr')].map(c => c.textContent)
    }));
    ok('B1 bienvenue spec + chips initiales', w.hasWelcome && w.chips.join(',').includes('SUV') && w.chips.length >= 4,
      w.chips.slice(0, 4).join(' | '));
    // B2: refus si aucun critere
    await say('voir les resultats');
    const refuse = await page.evaluate(() => {
      const bubs = [...document.querySelectorAll('#chatBody .ast-row.bot .ast-bub')];
      return bubs[bubs.length - 1]?.textContent || '';
    });
    ok('B2 refus sans critere', /budget|type/i.test(refuse), refuse.slice(0, 60) + '...');

    // B3: critere 1 -> question suivante
    await say('SUV');
    let st = await page.evaluate(() => ({
      prof: document.getElementById('advProf')?.textContent || '',
      last: [...document.querySelectorAll('#chatBody .ast-row.bot .ast-bub')].slice(-1)[0]?.textContent || ''
    }));
    ok('B3 ack SUV + question budget', /Compris\s*:?\s*SUV/i.test(st.last.replace(/\s+/g, ' ')) && /budget/i.test(st.last), st.last.slice(0, 70));
    ok('B4 panneau profil mis a jour', /Type\s*:\s*SUV/.test(st.prof));

    // B5: avis essence vs mazout
    await say('moins de 300000 DH');
    await say('cest quoi mieux, essence ou mazout ?');
    st = await page.evaluate(() =>
      [...document.querySelectorAll('#chatBody .ast-row.bot .ast-bub')].slice(-1)[0]?.textContent || '');
    ok('B5 avis carburant personnalise', /diesel|essence/i.test(st), st.slice(0, 70));

    // B6: trigger recherche -> page resultats filtree
    const carsLen = await page.evaluate(() => CARS.length);
    await say('voir les resultats');
    await page.waitForTimeout(1500);
    const res = await page.evaluate(() => ({
      onResults: document.getElementById('page-results').style.display !== 'none' || !!document.querySelector('.results-list')?.offsetParent,
      n: _allResults.length,
      q: document.getElementById('searchInput2').value
    }));
    ok('B6 recherche multicritere declenchee', res.onResults && res.n > 0 && res.n < carsLen,
      res.n + ' vehicules (' + res.q + ')');

    // B7: pas de JSON dans les reponses
    const noJson = await page.evaluate(() => {
      const t = document.getElementById('chatBody').textContent;
      return !/"reply"/.test(t) && !/"criteria"/.test(t);
    });
    ok('B7 aucune fuite JSON', noJson);

    const realErrors = errors.filter(e => !/net::|Failed to load resource/i.test(e));
    ok('B8 zero erreur JS chat', realErrors.length === 0, realErrors.slice(0, 2).join('|'));
    await page.close();
  }

  /* ===== C. DARIJA ARABIZI + ARABE ===== */
  {
    console.log('\n== C. Darija ==');
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + '/single.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => showPage('assistant'));
    await page.waitForSelector('#chatBody .ast-qr', { timeout: 12000 });
    const settle = async () => {
      await page.waitForTimeout(500);
      await page.waitForFunction(() => !document.querySelector('#chatBody .ast-streaming') && !document.querySelector('#chatBody .ast-typing'),
        null, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(350);
    };

    // C1: arabizi -> reponse darija
    await page.evaluate(() => { document.getElementById('chatInput').value = 'bghit SUV dial mazout'; sendMsg(); });
    await settle();
    const dz = await page.evaluate(() =>
      [...document.querySelectorAll('#chatBody .ast-row.bot .ast-bub')].slice(-1)[0]?.textContent || '');
    ok('C1 darija arabizi comprise', /(mazout|Diesel)/i.test(dz) && /Fhemt|budget|chhal/i.test(dz), dz.slice(0, 80));

    // C2: budget arabizi 250k
    await page.evaluate(() => { document.getElementById('chatInput').value = '250k DH'; sendMsg(); });
    await settle();
    let prof = await page.evaluate(() => document.getElementById('advProf')?.textContent || '');
    ok('C2 budget 250k extrait', /250[\s\u00a0.,]?000/.test(prof), prof.slice(0, 100).replace(/\n/g, ' '));

    // C3: trigger darija -> search
    await page.evaluate(() => { document.getElementById('chatInput').value = 'khlas warini'; sendMsg(); });
    await settle();
    await page.waitForTimeout(1200);
    const s = await page.evaluate(() => ({ n: _allResults.length, on: !!document.querySelector('.results-list')?.offsetParent }));
    ok('C3 khlas+warini -> resultats', s.on && s.n > 0, s.n + ' vehicules');
    await page.close();

    /* arabe */
    console.log('\n== D. Darija arabe ==');
    const p2 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p2.goto(BASE + '/single.html', { waitUntil: 'load', timeout: 30000 });
    await p2.waitForTimeout(1200);
    await p2.evaluate(() => showPage('assistant'));
    await p2.waitForSelector('#chatBody .ast-qr', { timeout: 12000 });
    await p2.evaluate(() => { document.getElementById('chatInput').value = 'بغيت كروزا مازوت'; sendMsg(); });
    await p2.waitForTimeout(500);
    await p2.waitForFunction(() => !document.querySelector('#chatBody .ast-streaming') && !document.querySelector('#chatBody .ast-typing'),
      null, { timeout: 15000 }).catch(() => {});
    await p2.waitForTimeout(350);
    const ar = await p2.evaluate(() =>
      [...document.querySelectorAll('#chatBody .ast-row.bot .ast-bub')].slice(-1)[0]?.textContent || '');
    const isArabicReply = /[\u0600-\u06FF]/.test(ar) && /تسجلت/.test(ar);
    ok('D1 reponse en darija arabe', isArabicReply, ar.slice(0, 70));
    const profAr = await p2.evaluate(() => document.getElementById('advProf')?.textContent || '');
    ok('D2 criteria restent en francais', /Berline/.test(profAr) && /Diesel/.test(profAr));
    await p2.close();
  }

  await browser.close();
  console.log('\n========================================');
  console.log('RÉSULTAT: ' + pass + ' PASS / ' + fail + ' FAIL');
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('ERREUR TESTS:', e); process.exit(2); });
