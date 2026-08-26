const{chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage();
await p.setViewportSize({width:1280,height:900});
const errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:8080/single.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1000);

console.log('Home visible:', await p.locator('#page-home').isVisible());

// Navigate to results
await p.click('[data-page=results]');
await p.waitForTimeout(500);
console.log('Results visible:', await p.locator('#page-results').isVisible());
console.log('Sidebar visible:', await p.locator('.sidebar').isVisible());
console.log('Sidebar chip visible:', await p.locator('.sidebar .chip').first().isVisible());

// Check total CARS count
var count = await p.evaluate(function(){return CARS.length;});
console.log('Total CARS:', count);

// Check Dacia count
var daciaCount = await p.evaluate(function(){return CARS.filter(function(c){return c.make==='Dacia';}).length;});
console.log('Dacia count:', daciaCount);

// Test search
var searchResult = await p.evaluate(function(){return searchCars('Dacia').length;});
console.log('Search Dacia results:', searchResult);

var searchSuv = await p.evaluate(function(){return searchCars('SUV hybride').length;});
console.log('Search SUV hybride results:', searchSuv);

console.log('JS errors:', errors.length === 0 ? 'NONE' : errors.join('; '));
await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
