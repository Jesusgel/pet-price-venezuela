import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const sizes = [
  { name: 'icon-192x192.svg', size: 192 },
  { name: 'icon-512x512.svg', size: 512 },
  { name: 'apple-touch-icon.svg', size: 180 },
];

const generateSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#321d0c"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-weight="700" font-size="${Math.round(size * 0.55)}"
        fill="#fdf9f4">S</text>
</svg>`;

const outputDir = join(process.cwd(), 'public', 'icons');
mkdirSync(outputDir, { recursive: true });

sizes.forEach(({ name, size }) => {
  const filePath = join(outputDir, name);
  writeFileSync(filePath, generateSVG(size).trim());
  console.log(`Generated: ${filePath}`);
});

const maskableSize = 512;
const padding = Math.round(maskableSize * 0.1);
const innerSize = maskableSize - padding * 2;
const maskableSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${maskableSize}" height="${maskableSize}" viewBox="0 0 ${maskableSize} ${maskableSize}">
  <rect width="${maskableSize}" height="${maskableSize}" fill="#321d0c"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-weight="700" font-size="${Math.round(innerSize * 0.55)}"
        fill="#fdf9f4">S</text>
</svg>`;

const maskablePath = join(outputDir, 'icon-maskable-512x512.svg');
writeFileSync(maskablePath, maskableSVG.trim());
console.log(`Generated: ${maskablePath}`);
