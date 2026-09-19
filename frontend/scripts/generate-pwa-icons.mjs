import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const solidBg = { r: 253, g: 249, b: 244, alpha: 1 }; // #fdf9f4 (for maskable)
const transparentBg = { r: 0, g: 0, b: 0, alpha: 0 };
const logoPath = join(process.cwd(), 'public', 'logo_el_saman.png');
const outputIconsDir = join(process.cwd(), 'public', 'icons');
const appDir = join(process.cwd(), 'src', 'app');

mkdirSync(outputIconsDir, { recursive: true });

async function run() {
  const trimmedBuffer = await sharp(logoPath).trim().toBuffer();

  async function makePNG(canvasSize, logoSize, outputPath, bg = transparentBg) {
    const resizedLogo = await sharp(trimmedBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: bg,
      },
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`Generated PNG: ${outputPath}`);
  }

  async function makeSVG(canvasSize, logoSize, outputPath, hasBackground = false) {
    const resizedLogo = await sharp(trimmedBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const base64 = resizedLogo.toString('base64');
    const offset = Math.round((canvasSize - logoSize) / 2);

    const bgRect = hasBackground
      ? `  <rect width="${canvasSize}" height="${canvasSize}" rx="${Math.round(canvasSize * 0.18)}" fill="#fdf9f4"/>\n`
      : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
${bgRect}  <image href="data:image/png;base64,${base64}" x="${offset}" y="${offset}" width="${logoSize}" height="${logoSize}"/>
</svg>`;

    writeFileSync(outputPath, svg.trim());
    console.log(`Generated SVG: ${outputPath}`);
  }

  // All PWA icons transparent (only logo contour visible)
  await makePNG(192, 172, join(outputIconsDir, 'icon-192x192.png'), transparentBg);
  await makePNG(512, 460, join(outputIconsDir, 'icon-512x512.png'), transparentBg);
  await makePNG(180, 160, join(outputIconsDir, 'apple-touch-icon.png'), transparentBg);
  await makePNG(512, 460, join(outputIconsDir, 'icon-maskable-512x512.png'), transparentBg);

  // Next.js static app icons (transparent background for browser tabs)
  await makePNG(48, 44, join(appDir, 'icon.png'), transparentBg);
  await makePNG(180, 160, join(appDir, 'apple-icon.png'), transparentBg);

  // Fallback SVGs
  await makeSVG(192, 172, join(outputIconsDir, 'icon-192x192.svg'), false);
  await makeSVG(512, 460, join(outputIconsDir, 'icon-512x512.svg'), false);
  await makeSVG(180, 160, join(outputIconsDir, 'apple-touch-icon.svg'), false);
  await makeSVG(512, 460, join(outputIconsDir, 'icon-maskable-512x512.svg'), false);

  // Transparent favicon.ico
  const png32 = await sharp(trimmedBuffer)
    .resize(32, 32, { fit: 'contain', background: transparentBg })
    .png()
    .toBuffer();

  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  icoHeader.writeUInt8(32, 6);
  icoHeader.writeUInt8(32, 7);
  icoHeader.writeUInt8(0, 8);
  icoHeader.writeUInt8(0, 9);
  icoHeader.writeUInt16LE(1, 10);
  icoHeader.writeUInt16LE(32, 12);
  icoHeader.writeUInt32LE(png32.length, 14);
  icoHeader.writeUInt32LE(22, 18);

  const ico = Buffer.concat([icoHeader, png32]);
  writeFileSync(join(appDir, 'favicon.ico'), ico);
  writeFileSync(join(process.cwd(), 'public', 'favicon.ico'), ico);
  console.log('Generated ICO: favicon.ico');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
