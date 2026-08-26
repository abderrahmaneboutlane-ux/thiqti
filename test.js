const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage();
  await p.setViewportSize({width:1280,height:900});
  const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:8080/single.html',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(500);

  var R=[];
  function ok(n,v){R.push((v?'PASS':'FAIL')+' '+n);}

  ok('home visible',await p.locator('#page-home').isVisible());
  ok('hero title',await p.locator('.hero h1').isVisible());
  ok('search input',await p.locator('#searchInput').isVisible());
  ok('home mic',await p.locator('#homeMic').isVisible());
  ok('4 quick chips',await p.locator('.chips .chip').count()===4);
  ok('3 stats',await p.locator('.stats .stat').count()===3);
  ok('5 nav links',await p.locator('.nav-link').count()===5);

  await p.click('[data-page=results]');await p.waitForTimeout(300);
  ok('results visible',await p.locator('#page-results').isVisible());
  ok('18 cards per page',(await p.locator('.results-list .card').count())===18);
  var src=await p.locator('.results-list .card-img img').first().getAttribute('src');
  ok('card has photo',src&&src.indexOf('loremflickr')>-1);
  ok('sidebar',await p.locator('.sidebar').isVisible());
  ok('sidebar chips',await p.locator('.sidebar .chip').count()>5);
  ok('color dots',await p.locator('.sidebar .cdot').count()===5);

  var fc=await p.locator('.sidebar .chip').first();
  var h1=await fc.evaluate(function(e){return e.classList.contains('on');});
  await fc.click();var h2=await fc.evaluate(function(e){return e.classList.contains('on');});
  ok('chip toggles',h1!==h2);await fc.click();

  await p.locator('.sidebar input[type=range]').fill('500000');
  ok('budget updates',(await p.locator('#budgetVal').textContent()).indexOf('500')>-1);
  ok('view toggle',await p.locator('.vt').count()===2);

  var heart=await p.locator('.results-list .card-fav').first();
  var hb=await heart.textContent();await heart.click();var ha=await heart.textContent();
  ok('fav heart toggles',hb.trim()!==ha.trim());

  await p.locator('.results-list .card').first().click();await p.waitForTimeout(300);
  ok('vehicle visible',await p.locator('#page-vehicle').isVisible());
  ok('vehicle photo',await p.locator('.vh-img img').count()>0);
  ok('vehicle tabs',await p.locator('.tab').count()===3);
  ok('specs grid',await p.locator('.specs .spec').count()===8);

  await p.locator('.tab').nth(1).click();await p.waitForTimeout(200);
  ok('rep tab',await p.locator('#tab-rep').isVisible());
  await p.locator('.tab').nth(2).click();await p.waitForTimeout(200);
  ok('offers tab',await p.locator('#tab-offers').isVisible());
  await p.locator('.tab').nth(0).click();await p.waitForTimeout(200);
  ok('specs back',await p.locator('#tab-specs').isVisible());

  await p.locator('.vh-acts .btn-p').click();
  ok('fav toggle',(await p.locator('.vh-acts').textContent()).indexOf('Sauvegarde')>-1);

  await p.click('[data-page=compare]');await p.waitForTimeout(300);
  ok('compare visible',await p.locator('#page-compare').isVisible());
  ok('compare table',await p.locator('.cmp-tbl').isVisible());
  ok('compare photos',await p.locator('.c-hd-img img').count()===3);
  ok('compare summary',await p.locator('.cmp-sum').isVisible());

  await p.click('[data-page=favorites]');await p.waitForTimeout(300);
  ok('favorites visible',await p.locator('#page-favorites').isVisible());
  ok('fav cards',await p.locator('.fav-grid .card').count()===3);
  ok('fav photos',await p.locator('.fav-grid .card-img img').count()===3);

  await p.click('[data-page=assistant]');await p.waitForTimeout(1500);
  ok('assistant visible',await p.locator('#page-assistant').isVisible());
  ok('welcome msgs',await p.locator('.ast-row').count()===2);
  ok('suggestion chips',await p.locator('.ast-qs .chip').count()===4);
  ok('chat input',await p.locator('#chatInput').isVisible());
  ok('chat mic',await p.locator('#micBtn').isVisible());
  ok('sidebar visible',await p.locator('.ast-sidebar').isVisible());
  ok('sidebar features',(await p.locator('.ast-sb-feat').count())>=3);

  await p.fill('#chatInput','SUV hybride pour la famille');
  await p.click('.ast-send');await p.waitForTimeout(3000);
  ok('chat msgs after send',(await p.locator('.ast-row').count())>=3);
  ok('chat cards',(await p.locator('.ast-card').count())===3);
  ok('chat card name',(await p.locator('.ast-card .ci-t').first().textContent()).length>3);
  ok('chat card img',(await p.locator('.ast-card .ci-svg img').count())===3);

  await p.click('.ast-new-chat');await p.waitForTimeout(1000);
  ok('reset chat',(await p.locator('.ast-row').count())===2);

  await p.click('[data-page=home]');await p.waitForTimeout(200);
  await p.locator('.chips .chip').first().click();await p.waitForTimeout(200);
  ok('quick search->results',await p.locator('#page-results').isVisible());

  ok('no js errors',errors.length===0);

  var pass=R.filter(function(r){return r.indexOf('PASS')===0;}).length;
  console.log('=== '+pass+'/'+R.length+' PASSED ===');
  R.forEach(function(r){console.log(r);});
  if(errors.length)console.log('JS Errors:',errors);
  await b.close();
})().catch(function(e){console.error('FATAL: '+e.message);process.exit(1);});
