async function testFotmobSearch() {
  const terms = ['Haaland', 'Bellingham', 'Saka', 'Mbappe', 'Vinicius'];
  const endpoints = [
    (t) => `https://www.fotmob.com/api/search/suggest?term=${t}`,
    (t) => `https://www.fotmob.com/api/searchapi/suggest?term=${t}`,
    (t) => `https://apigw.fotmob.com/searchapi/suggest?term=${t}`,
  ];

  for (const ep of endpoints) {
    const url = ep('haaland');
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Referer': 'https://www.fotmob.com/',
        },
      });
      console.log('EP:', url, '->', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Data:', JSON.stringify(data).slice(0, 300));
        return;
      }
    } catch (e) {
      console.log('EP err:', url, e.message);
    }
  }
}
testFotmobSearch();
