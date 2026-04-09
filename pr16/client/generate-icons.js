const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 192, 512];
const OUTPUT_DIR = path.join(__dirname, 'icons');

const BG_COLOR = '#4f46e5';
const FG_COLOR = '#ffffff';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const radius = size * 0.18;

  ctx.fillStyle = BG_COLOR;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = FG_COLOR;
  const fontSize = Math.round(size * 0.55);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', size / 2, size / 2 + size * 0.03);

  return canvas.toBuffer('image/png');
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

SIZES.forEach((size) => {
  const buffer = drawIcon(size);
  const filePath = path.join(OUTPUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Создана иконка: ${filePath}`);
});

console.log('Готово! Все иконки сгенерированы.');
