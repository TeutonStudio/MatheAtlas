// Pfad: ../tools/mathjax_tex2svg.mjs

import {mathjax} from 'mathjax-full/js/mathjax.js';
import {TeX} from 'mathjax-full/js/input/tex.js';
import {SVG} from 'mathjax-full/js/output/svg.js';
import {liteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor.js';
import {RegisterHTMLHandler} from 'mathjax-full/js/handlers/html.js';
import {AllPackages} from 'mathjax-full/js/input/tex/AllPackages.js';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

const display = process.argv.includes('--display');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: AllPackages,
  // optional: inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$','$$'], ['\\[','\\]']]
});

const svg = new SVG({
  fontCache: 'none' // wichtig: macht SVG selbständiger (keine externen Cache-Dateien)
});

const html = mathjax.document('', {InputJax: tex, OutputJax: svg});

const input = (await readStdin()).trim();

try {
  const node = html.convert(input, {display});
  const svgNode = adaptor.firstChild(node) ?? node;
  const svgMarkup = adaptor.outerHTML(svgNode);

  process.stdout.write(svgMarkup);
} catch (e) {
  console.error(String(e && e.stack ? e.stack : e));
  process.exit(1);
}
