import fs from 'fs';
import path from 'path';

const dir = './public/player-photos';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  let removed = 0;
  for (const f of files) {
    if (f !== 'rodri.webp') {
      fs.unlinkSync(path.join(dir, f));
      removed++;
    }
  }
  console.log(`Cleaned up /public/player-photos: removed ${removed} files, kept rodri.webp (locked).`);
}
