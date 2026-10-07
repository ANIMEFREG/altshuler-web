// Скачивает шрифты Heebo и Rubik (иврит + латиница) с Google Fonts в папку fonts/ и пишет _source/fonts.css
// Запуск: node _source/get-fonts.js (нужен только если меняем шрифты)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(__dirname, 'gfonts.css'), 'utf8');
const blocks = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[\s\S]*?\})/g)].filter(m => ['hebrew', 'latin'].includes(m[1]));
const urls = new Map();
const out = blocks.map(([, subset, block]) => {
  const fam = block.match(/font-family: '([^']+)'/)[1];
  const url = block.match(/url\((https:[^)]+)\)/)[1];
  if (!urls.has(url)) urls.set(url, `${fam.toLowerCase()}-${subset}-${urls.size}.woff2`);
  return block.replace(url, `FONTS/${urls.get(url)}`);
}).join('\n');
(async () => {
  for (const [url, file] of urls) {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(path.join(ROOT, 'fonts', file), buf);
    console.log(file, Math.round(buf.length / 1024) + ' КБ');
  }
  fs.writeFileSync(path.join(__dirname, 'fonts.css'), out);
  console.log(blocks.length, 'правил @font-face');
})();
