import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const outFile = path.join(rootDir, 'sky-rift-standalone.html');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// 1. Inline compiled CSS stylesheet(s)
html = html.replace(
  /<link\s+rel="stylesheet"[^>]*href="(\.\/assets\/[^"]+\.css)"[^>]*>/g,
  (_match, relHref) => {
    const cssPath = path.join(distDir, relHref.replace(/^\.\//, ''));
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    return `<style>\n${cssContent}\n</style>`;
  }
);

// 2. Prepare embedded Data URI for hero photograph so single HTML works 100% offline
const heroImgPath = path.join(
  distDir,
  'assets/aistudio/hero_section_background_01865031.JPG'
);
let heroDataUri = null;
if (fs.existsSync(heroImgPath)) {
  const imgBuffer = fs.readFileSync(heroImgPath);
  heroDataUri = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
}

// 3. Inline compiled JS module bundle(s) and embed image data URI
html = html.replace(
  /<script\s+type="module"[^>]*src="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/g,
  (_match, relSrc) => {
    const jsPath = path.join(distDir, relSrc.replace(/^\.\//, ''));
    let jsContent = fs.readFileSync(jsPath, 'utf8');

    if (heroDataUri) {
      jsContent =
        `const __SKY_RIFT_HERO_IMG__=${JSON.stringify(heroDataUri)};\n` +
        jsContent
          .replaceAll('`./assets/aistudio/hero_section_background_01865031.JPG`', '__SKY_RIFT_HERO_IMG__')
          .replaceAll('"./assets/aistudio/hero_section_background_01865031.JPG"', '__SKY_RIFT_HERO_IMG__')
          .replaceAll("'./assets/aistudio/hero_section_background_01865031.JPG'", '__SKY_RIFT_HERO_IMG__');
    }

    // Safely escape closing script tags inside inlined JS
    jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');
    return `<script type="module">\n${jsContent}\n</script>`;
  }
);

fs.writeFileSync(outFile, html, 'utf8');
const sizeMb = (Buffer.byteLength(html, 'utf8') / (1024 * 1024)).toFixed(2);
console.log(`Generated standalone single-file HTML: ${outFile} (${sizeMb} MB)`);
