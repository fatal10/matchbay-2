async function testHotlinking() {
  const url = 'https://images.fotmob.com/image_resources/playerimages/737066.png';
  const headersList = [
    { name: 'Browser direct without referer', headers: {} },
    { name: 'Browser with local origin', headers: { 'Origin': 'http://localhost:3000', 'Referer': 'http://localhost:3000/' } },
    { name: 'Browser with cloudflare worker host', headers: { 'Origin': 'https://matchbay.workers.dev', 'Referer': 'https://matchbay.workers.dev/' } },
    { name: 'Browser with empty referer (referrerpolicy=no-referrer)', headers: { 'Referer': '' } },
  ];

  for (const h of headersList) {
    const res = await fetch(url, { headers: h.headers });
    console.log(`${h.name}: Status ${res.status}, Type ${res.headers.get('content-type')}, CORS: ${res.headers.get('access-control-allow-origin')}`);
  }
}
testHotlinking();
