const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Home page
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/home.png', fullPage: true });
  console.log('Home page captured');
  
  // Chat page
  await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/chat.png', fullPage: true });
  console.log('Chat page captured');
  
  // Results page
  await page.goto('http://localhost:3000/results?q=Dacia', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/cucu4/Desktop/results.png', fullPage: true });
  console.log('Results page captured');
  
  await browser.close();
  console.log('Done!');
})();
