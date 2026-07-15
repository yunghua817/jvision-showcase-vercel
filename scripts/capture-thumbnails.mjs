import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const source = await readFile(path.join(root, "src/data/products.ts"), "utf8");
const products = [...source.matchAll(/"demoUrl"\s*:\s*"([^"]+)"[\s\S]*?"slug"\s*:\s*"([^"]+)"/g)]
  .map((match) => ({ demoUrl: match[1], slug: match[2] }));

if (!products.length) throw new Error("No products found in src/data/products.ts");

const outputDirectory = path.join(root, "public/thumbnails");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
let cursor = 0;
let completed = 0;
const failures = [];

async function captureWorker(workerId) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
  page.on("dialog", (dialog) => dialog.dismiss());

  while (cursor < products.length) {
    const product = products[cursor++];
    const outputPath = path.join(outputDirectory, `${product.slug}.jpg`);
    try {
      await page.goto(product.demoUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
      await page.waitForTimeout(700);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.addStyleTag({ content: "html{scrollbar-width:none}body::-webkit-scrollbar{display:none}" }).catch(() => undefined);
      await page.screenshot({ path: outputPath, type: "jpeg", quality: 72, fullPage: false });
      completed += 1;
      console.log(`[${completed}/${products.length}] ${product.slug} captured by worker ${workerId}`);
    } catch (error) {
      failures.push({ slug: product.slug, url: product.demoUrl, message: error instanceof Error ? error.message : String(error) });
      console.warn(`[failed] ${product.slug} ${product.demoUrl}`);
    }
  }

  await page.close();
}

await Promise.all(Array.from({ length: Math.min(5, products.length) }, (_, index) => captureWorker(index + 1)));
await browser.close();

console.log(`Captured ${completed}/${products.length} thumbnails.`);
if (failures.length) {
  console.log(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}
