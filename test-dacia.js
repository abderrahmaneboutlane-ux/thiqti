const{chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage();
await p.setViewportSize({width:1280,height:900});
const errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:8080/single.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(500);

// Test 1: Chat Dacia search
await p.click('[data-page=assistant]');
await p.waitForTimeout(1500);
await p.fill('#chatInput','Dacia');
await p.click('.ast-send');
await p.waitForTimeout(3000);
var cards=await p.locator('.ast-card').count();
console.log('Dacia chat cards: '+cards);
var names=[];
for(var i=0;i<cards;i++){names.push(await p.locator('.ast-card .ci-t').nth(i).textContent());}
console.log('Names: '+names.join(', '));
var allDacia=names.every(function(n){return n.indexOf('Dacia')>-1;});
console.log('All Dacia chat: '+(allDacia?'PASS':'FAIL'));

// Test 2: Results page Dacia search
await p.click('[data-page=home]');
await p.waitForTimeout(200);
await p.fill('#searchInput','Dacia');
await p.locator('.search .btn-p').first().click();
await p.waitForTimeout(1000);
var resultCards=await p.locator('.results-list .card').count();
console.log('Dacia results cards: '+resultCards);
var rnames=[];
for(var i=0;i<resultCards;i++){rnames.push(await p.locator('.results-list .card-title').nth(i).textContent());}
console.log('Result names: '+rnames.join(', '));
var allDaciaR=rnames.every(function(n){return n.indexOf('Dacia')>-1;});
console.log('All Dacia results: '+(allDaciaR?'PASS':'FAIL'));

console.log('JS errors: '+(errors.length===0?'PASS':'FAIL ('+errors.join('; ')+')'));
await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
