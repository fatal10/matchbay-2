async function testUrls() {
  const ids = [
    { id: '737066', name: 'Haaland' },
    { id: '169200', name: 'De Bruyne' },
    { id: '675088', name: 'Rodri' },
    { id: '846033', name: 'Vinicius Jr' },
    { id: '1077894', name: 'Jude Bellingham' },
    { id: '701154', name: 'Kylian Mbappe' },
    { id: '961995', name: 'Bukayo Saka' },
    { id: '534670', name: 'Odegaard' },
    { id: '654096', name: 'Declan Rice' },
    { id: '209405', name: 'Van Dijk' }
  ];

  for (const item of ids) {
    const url = `https://images.fotmob.com/image_resources/playerimages/${item.id}.png`;
    const res = await fetch(url);
    console.log(`${item.name} (${item.id}): status=${res.status}, type=${res.headers.get('content-type')}, bytes=${res.headers.get('content-length')}`);
  }
}
testUrls();
