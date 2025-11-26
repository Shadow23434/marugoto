#!/usr/bin/env node
/**
 * Download all thumbnail images referenced in a candos.json file.
 *
 * Targets both:
 *   - step1.movies[*].thumbnail (Practice movie thumbnails)
 *   - step2.thumbnail           (Challenge movie thumbnails)
 *
 * Outputs to (by default):
 *   assets/movies/thumbnail/topics/*.jpg
 *
 * Usage (PowerShell):
 *   node scripts/download-thumbnails.js
 *   node scripts/download-thumbnails.js --input data/en/candos.json
 *   node scripts/download-thumbnails.js --lang en
 *   node scripts/download-thumbnails.js --outDir assets/movies/thumbnail/topics --force
 *   node scripts/download-thumbnails.js --limit 5
 *
 * Flags:
 *   --input <path>   Path to candos.json (overrides --lang)
 *   --lang <code>    One of en|ja|es (default: en). Uses data/<lang>/candos.json
 *   --outDir <path>  Output directory (default: assets/movies/thumbnail/topics)
 *   --force          Overwrite existing files
 *   --concurrency N  Parallel downloads (default: 6)
 *   --retries N      Retry count for 4xx/5xx (default: 2)
 *   --delay ms       Delay between tasks to be polite (default: 200)
 *   --limit N        Only download first N thumbnails (for testing)
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const http = require("http");
const https = require("https");

function parseArgs(argv) {
  const args = {
    lang: "en",
    outDir: path.join("assets", "movies", "thumbnail", "topics"),
    force: false,
    concurrency: 6,
    retries: 2,
    delay: 200, // ms between starting tasks
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--lang") args.lang = argv[++i] || "en";
    else if (a === "--input") args.input = argv[++i];
    else if (a === "--outDir") args.outDir = argv[++i];
    else if (a === "--concurrency")
      args.concurrency = parseInt(argv[++i] || "6", 10) || 6;
    else if (a === "--retries")
      args.retries = parseInt(argv[++i] || "2", 10) || 2;
    else if (a === "--delay")
      args.delay = parseInt(argv[++i] || "200", 10) || 0;
    else if (a === "--limit") args.limit = parseInt(argv[++i] || "0", 10) || 0;
    else {
      // shorthand
      if (a === "-f") args.force = true;
      else if (a === "-l") args.lang = argv[++i] || "en";
      else if (a === "-i") args.input = argv[++i];
      else if (a === "-o") args.outDir = argv[++i];
      else if (a === "-c")
        args.concurrency = parseInt(argv[++i] || "6", 10) || 6;
      else if (a === "-r") args.retries = parseInt(argv[++i] || "2", 10) || 2;
      else if (a === "-d") args.delay = parseInt(argv[++i] || "200", 10) || 0;
      else if (a === "-n") args.limit = parseInt(argv[++i] || "0", 10) || 0;
      else console.warn(`Unknown argument: ${a}`);
    }
  }
  if (!args.input) {
    args.input = path.join("data", args.lang, "candos.json");
  }
  return args;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

function basenameFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return path.basename(u.pathname);
  } catch (e) {
    return path.basename(urlStr);
  }
}

function selectableClient(urlStr) {
  return urlStr.startsWith("https:") ? https : http;
}

function buildHeaders(urlStr) {
  let referer = undefined;
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const lang = parts[0];
      referer = `${u.origin}/${lang}/`;
    } else {
      referer = u.origin + "/";
    }
  } catch (_) {
    referer = "https://a1.marugotoweb.jp/en/";
  }
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.8,ja;q=0.6",
    Referer: referer,
    Connection: "keep-alive",
  };
}

function downloadToFile(
  urlStr,
  destPath,
  { maxRedirects = 5, force = false, attempt = 0, retries = 0 } = {}
) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const doDownload = (currentUrl, redirectsLeft) => {
      const client = selectableClient(currentUrl);
      const headers = buildHeaders(currentUrl);
      const request = client.get(currentUrl, { headers }, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (redirectsLeft <= 0) {
            return reject(new Error(`Too many redirects for ${currentUrl}`));
          }
          const nextUrl = new URL(res.headers.location, currentUrl).href;
          res.resume();
          return doDownload(nextUrl, redirectsLeft - 1);
        }

        if (res.statusCode !== 200) {
          res.resume();
          if (
            [403, 429, 500, 502, 503].includes(res.statusCode) &&
            attempt < retries
          ) {
            const wait = 500 + attempt * 500;
            return setTimeout(() => {
              downloadToFile(urlStr, destPath, {
                maxRedirects,
                force,
                attempt: attempt + 1,
                retries,
              })
                .then(resolve)
                .catch(reject);
            }, wait);
          }
          return reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
        }

        const tmpPath = destPath + ".tmp";
        const fileStream = fs.createWriteStream(tmpPath);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close(async () => {
            try {
              await fsp.rename(tmpPath, destPath);
              const ms = Date.now() - start;
              resolve({ url: currentUrl, path: destPath, ms });
            } catch (err) {
              reject(err);
            }
          });
        });
        fileStream.on("error", (err) => {
          res.destroy();
          reject(err);
        });
      });

      request.on("error", (err) => reject(err));
      request.setTimeout(30000, () => {
        request.destroy(new Error(`Timeout fetching ${currentUrl}`));
      });
    };

    if (!force && fs.existsSync(destPath)) {
      return resolve({ url: urlStr, path: destPath, skipped: true });
    }

    doDownload(urlStr, maxRedirects);
  });
}

async function readCandosJson(jsonPath) {
  const raw = await fsp.readFile(jsonPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON at ${jsonPath}: ${e.message}`);
  }
}

function extractThumbnails(candos) {
  const urls = new Set();
  for (const entry of candos) {
    if (!entry || !Array.isArray(entry.steps)) continue;
    for (const step of entry.steps) {
      if (!step) continue;
      // step1: movies[*].thumbnail
      if (Array.isArray(step.movies)) {
        for (const m of step.movies) {
          if (m && typeof m.thumbnail === "string" && m.thumbnail.trim()) {
            urls.add(m.thumbnail.trim());
          }
        }
      }
      // step2: step.thumbnail
      if (typeof step.thumbnail === "string" && step.thumbnail.trim()) {
        urls.add(step.thumbnail.trim());
      }
    }
  }
  return Array.from(urls);
}

async function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(args.input);
  const outDir = path.resolve(args.outDir);

  console.log(`[info] Input JSON: ${inputPath}`);
  console.log(`[info] Output dir : ${outDir}`);
  console.log(`[info] Force overwrite: ${args.force}`);

  await ensureDir(outDir);

  const candos = await readCandosJson(inputPath);
  let urls = extractThumbnails(candos);
  if (args.limit && args.limit > 0) {
    urls = urls.slice(0, args.limit);
  }
  console.log(`[info] Found ${urls.length} thumbnail URLs.`);

  let success = 0,
    skipped = 0,
    failed = 0;
  const queue = urls.map((url) => ({ url }));

  console.log(
    `[info] Starting downloads (total ${queue.length}) with concurrency=${args.concurrency}, retries=${args.retries}`
  );

  async function worker(id) {
    while (queue.length) {
      const item = queue.shift();
      if (!item) break;
      const name = basenameFromUrl(item.url);
      const dest = path.join(outDir, name);
      try {
        const r = await downloadToFile(item.url, dest, {
          force: args.force,
          retries: args.retries,
        });
        if (r.skipped) {
          skipped++;
          console.log(`[skip] ${name}`);
        } else {
          success++;
          console.log(`[ok]   ${name}`);
        }
      } catch (e) {
        failed++;
        console.warn(`[fail] ${name}: ${e.message}`);
      }
      if (args.delay) await new Promise((res) => setTimeout(res, args.delay));
    }
  }

  const workers = [];
  const count = Math.max(1, args.concurrency);
  for (let i = 0; i < count; i++) workers.push(worker(i));
  await Promise.all(workers);

  console.log(
    `[done] success=${success}, skipped=${skipped}, failed=${failed}`
  );
  if (failed > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((e) => {
    console.error("[fatal] ", e);
    process.exit(1);
  });
}
