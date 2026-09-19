import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const bg = { r: 253, g: 249, b: 244, alpha: 1 }; // #fdf9f4
const logoPath = join(process.cwd(), 'public', 'logo_el_saman.png');
const outputIconsDir = join(process.cwd(), 'public', 'icons');
const appDir = join(process.cwd(), 'src', 'app');

mkdirSync(outputIconsDir, { recursive: true });

async function run() {
  const trimmedBuffer = await sharp(logoPath).trim().toBuffer();

  async function makePNG(canvasSize, logoSize, outputPath) {
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

  async function makeSVG(canvasSize, logoSize, outputPath) {
    const resizedLogo = await sharp(trimmedBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const base64 = resizedLogo.toString('base64');
    const offset = Math.round((canvasSize - logoSize) / 2);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
  <rect width="${canvasSize}" height="${canvasSize}" rx="${Math.round(canvasSize * 0.18)}" fill="#fdf9f4"/>
  <image href="data:image/png;base64,${base64}" x="${offset}" y="${offset}" width="${logoSize}" height="${logoSize}"/>
</svg>`;

    writeFileSync(outputPath, svg.trim());
    console.log(`Generated SVG: ${outputPath}`);
  }

  // PWA PNG icons
  await makePNG(192, 154, join(outputIconsDir, 'icon-192x192.png'));
  await makePNG(512, 410, join(outputIconsDir, 'icon-512x512.png'));
  await makePNG(512, 360, join(outputIconsDir, 'icon-maskable-512x512.png'));
  await makePNG(180, 144, join(outputIconsDir, 'apple-touch-icon.png'));

  // Next.js static app icons
  await makePNG(48, 40, join(appDir, 'icon.png'));
  await makePNG(180, 144, join(appDir, 'apple-icon.png'));

  // Fallback SVGs for backwards compatibility
  await makeSVG(192, 154, join(outputIconsDir, 'icon-192x192.svg'));
  await makeSVG(512, 410, join(outputIconsDir, 'icon-512x512.svg'));
  await makeSVG(512, 360, join(outputIconsDir, 'icon-maskable-512x512.svg'));
  await makeSVG(180, 144, join(outputIconsDir, 'apple-touch-icon.svg'));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
