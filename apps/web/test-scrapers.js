async function test() {
  // Test loremflickr - free image service by keyword
  const urls = [
    'https://loremflickr.com/400/300/dacia,sandero',
    'https://loremflickr.com/400/300/renault,clio',
    'https://loremflickr.com/400/300/toyota,yaris',
  ];
  
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
      console.log(url.split('/').pop(), '->', res.status, res.headers.get('location')?.substring(0, 100) || 'no redirect');
    } catch(e) { console.error(url, 'error:', e.message); }
  }
}
test();
