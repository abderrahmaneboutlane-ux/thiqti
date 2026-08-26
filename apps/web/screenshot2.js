const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Home page - wait for cars to load
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/home2.png', fullPage: true });
  console.log('Home page captured');
  
  // Chat page
  await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/chat2.png', fullPage: false });
  console.log('Chat page captured');
  
  // Test chat - type a message
  await page.fill('input[aria-label="Votre message"]', 'SUV diesel moins de 300k');
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Envoyer"]');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/chat2_results.png', fullPage: false });
  console.log('Chat with results captured');
  
  // Results page
  await page.goto('http://localhost:3000/results?q=SUV', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/results2.png', fullPage: true });
  console.log('Results page captured');
  
  // Favorites page
  await page.goto('http://localhost:3000/favorites', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/favorites2.png', fullPage: false });
  console.log('Favorites page captured');
  
  // Compare page
  await page.goto('http://localhost:3000/compare', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/compare2.png', fullPage: false });
  console.log('Compare page captured');
  
  await browser.close();
  console.log('Done!');
})();
