import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');
const outputHtmlPath = path.join(rootDir, 'sky-rift-standalone.html');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const assetFiles = fs.readdirSync(assetsDir);
const jsFile = assetFiles.find((f) => f.startsWith('index-') && f.endsWith('.js'));
const cssFile = assetFiles.find((f) => f.startsWith('index-') && f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Built JS or CSS bundle not found in dist/assets/.');
  process.exit(1);
}

let jsCode = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
const cssCode = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

// Embed hero photo once as a single JS constant so the standalone HTML works 100% offline
const heroImgPath = path.join(
  rootDir,
  'public/assets/aistudio/hero_section_background_01865031.JPG'
);
if (fs.existsSync(heroImgPath)) {
  const heroBase64 = fs.readFileSync(heroImgPath).toString('base64');
  const heroDataUri = `data:image/jpeg;base64,${heroBase64}`;
  jsCode =
    `const __SKYRIFT_HERO_IMG__=${JSON.stringify(heroDataUri)};\n` +
    jsCode
      .replaceAll('`./assets/aistudio/hero_section_background_01865031.JPG`', '__SKYRIFT_HERO_IMG__')
      .replaceAll('"./assets/aistudio/hero_section_background_01865031.JPG"', '__SKYRIFT_HERO_IMG__')
      .replaceAll("'./assets/aistudio/hero_section_background_01865031.JPG'", '__SKYRIFT_HERO_IMG__');
}

// Escape closing script tags inside JS string literals so HTML parsing stays intact
const safeJsCode = jsCode.replace(/<\/script/gi, '<\\/script');
const safeCssCode = cssCode.replace(/<\/style/gi, '<\\/style');

// Replace external stylesheet & script tags in dist/index.html with inlined equivalents
let standaloneHtml = html
  .replace(/<link[^>]*rel="stylesheet"[^>]*href="\.\/assets\/[^"]+\.css"[^>]*>/i, '')
  .replace(/<script[^>]*src="\.\/assets\/[^"]+\.js"[^>]*><\/script>/i, '');

standaloneHtml = standaloneHtml
  .replace('</head>', `    <style>\n${safeCssCode}\n    </style>\n  </head>`)
  .replace(
    '</body>',
    `    <script type="module">\n${safeJsCode}\n    </script>\n  </body>`
  );

fs.writeFileSync(outputHtmlPath, standaloneHtml, 'utf8');
const sizeMb = (fs.statSync(outputHtmlPath).size / (1024 * 1024)).toFixed(2);
console.log(`Generated ${outputHtmlPath} (${sizeMb} MB)`);
