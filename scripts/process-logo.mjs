import sharp from "sharp";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const sources = [
  join(root, "public/logo-source.png"),
  join(root, "public/logo-source.jpg"),
  join(root, "public/logo-source.jpeg"),
  join(root, "public/logo-source.webp"),
  join(root, "../Motempo/Motempo Logo Black.png"),
  join(root, "../Motempo/Motempo Logo White.png"),
];

const input = sources.find((p) => existsSync(p));
if (!input) {
  console.error(
    "Add your logo as public/logo-source.png (black on white or transparent).",
  );
  process.exit(1);
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.alloc(width * height * 4);

let sum = 0;
for (let i = 0; i < data.length; i += channels) {
  sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
}
const mean = sum / (width * height);

for (let i = 0, p = 0; i < data.length; i += channels, p += 4) {
  const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const a = channels === 4 ? data[i + 3] : 255;

  if (a < 16) {
    out[p + 3] = 0;
    continue;
  }

  if (mean > 100) {
    // Black logo on light background
    if (lum > 200) {
      out[p + 3] = 0;
    } else {
      const alpha = Math.min(255, Math.round(((255 - lum) / 255) * 255));
      out[p] = 255;
      out[p + 1] = 255;
      out[p + 2] = 255;
      out[p + 3] = alpha;
    }
  } else {
    // Dark export: lighter pixels are the mark
    if (lum < 8) {
      out[p + 3] = 0;
    } else {
      out[p] = 255;
      out[p + 1] = 255;
      out[p + 2] = 255;
      out[p + 3] = Math.min(255, Math.round((lum / 64) * 255));
    }
  }
}

const outputPath = join(root, "public/logo.png");
await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);

let opaque = 0;
for (let i = 3; i < out.length; i += 4) {
  if (out[i] > 10) opaque++;
}

console.log(`Wrote ${outputPath} (${opaque} visible pixels)`);

if (opaque < 1000) {
  console.error(
    "\nSource file has almost no logo detail. Re-export from your design app:\n" +
      "  • PNG with black logo on white, OR black on transparent\n" +
      "  • Save as public/logo-source.png\n" +
      "  • Run npm run process-logo again\n",
  );
  process.exit(1);
}
