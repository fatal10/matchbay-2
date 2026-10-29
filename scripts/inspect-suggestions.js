async function inspectSuggest(name) {
  const q = encodeURIComponent(name);
  const res = await fetch(`https://apigw.fotmob.com/searchapi/suggest?term=${q}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await res.json();
  console.log(`\n=== Suggestions for ${name} ===`);
  const options = (data.squadMemberSuggest && data.squadMemberSuggest[0] && data.squadMemberSuggest[0].options) || [];
  for (const opt of options) {
    console.log(opt.text, opt.payload);
  }
}
async function run() {
  await inspectSuggest('Kevin De Bruyne');
  await inspectSuggest('Rodri');
  await inspectSuggest('Vinicius');
  await inspectSuggest('Bellingham');
  await inspectSuggest('Kylian Mbappe');
}
run();
