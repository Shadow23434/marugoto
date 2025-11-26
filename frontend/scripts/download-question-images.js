#!/usr/bin/env node
/**
 * Download all Step1 question images referenced in candos.json.
 *
 * Source fields:
 *   - steps[*] where id === 'step1' and step.question.images is an array of URLs
 *
 * Default output:
 *   assets/images/topic/questions/<filename>
 *
 * Optional: also mirror files into assets/images/topic/<filename>
 * (use --mirrorToTopic to enable; helpful because the app maps to assets/images/topic/<file>)
 *
 * Usage (PowerShell on Windows):
 *   node scripts/download-question-images.js
 *   node scripts/download-question-images.js --lang en
 *   node scripts/download-question-images.js --lang all
 *   node scripts/download-question-images.js --input data/en/candos.json
 *   node scripts/download-question-images.js --outDir assets/images/topic/questions
 *   node scripts/download-question-images.js --mirrorToTopic
 *   node scripts/download-question-images.js --concurrency 6 --retries 2 --force
 *   node scripts/download-question-images.js --limit 10
 *
 * Flags:
 *   --input <path>     Path to a specific candos.json (overrides --lang)
 *   --lang <code>      One of en|ja|es|all (default: en)
 *   --outDir <path>    Destination directory (default: assets/images/topic/questions)
 *   --mirrorToTopic    Also copy to assets/images/topic/<filename> (default: false)
 *   --topicDir <path>  Mirror directory when --mirrorToTopic is set (default: assets/images/topic)
 *   --force            Overwrite existing files
 *   --concurrency N    Parallel downloads (default: 6)
 *   --retries N        Retry count for 403/429/5xx (default: 2)
 *   --delay ms         Delay between tasks to be polite (default: 200)
 *   --limit N          Only download first N items (for testing)
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const http = require("http");
const https = require("https");

function parseArgs(argv) {
  const args = {
    lang: "en",
    outDir: path.join("assets", "images", "topic", "questions"),
    topicDir: path.join("assets", "images", "topic"),
    mirrorToTopic: false,
    force: false,
    concurrency: 6,
    retries: 2,
    delay: 200,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--mirrorToTopic") args.mirrorToTopic = true;
    else if (a === "--lang") args.lang = argv[++i] || "en";
    else if (a === "--input") args.input = argv[++i];
    else if (a === "--outDir") args.outDir = argv[++i];
    else if (a === "--topicDir") args.topicDir = argv[++i];
    else if (a === "--concurrency")
      args.concurrency = parseInt(argv[++i] || "6", 10) || 6;
    else if (a === "--retries")
      args.retries = parseInt(argv[++i] || "2", 10) || 2;
    else if (a === "--delay")
      args.delay = parseInt(argv[++i] || "200", 10) || 0;
    else if (a === "--limit") args.limit = parseInt(argv[++i] || "0", 10) || 0;
    else {
      // short options
      if (a === "-f") args.force = true;
      else if (a === "-m") args.mirrorToTopic = true;
      else if (a === "-l") args.lang = argv[++i] || "en";
      else if (a === "-i") args.input = argv[++i];
      else if (a === "-o") args.outDir = argv[++i];
      else if (a === "-t") args.topicDir = argv[++i];
      else if (a === "-c")
        args.concurrency = parseInt(argv[++i] || "6", 10) || 6;
      else if (a === "-r") args.retries = parseInt(argv[++i] || "2", 10) || 2;
      else if (a === "-d") args.delay = parseInt(argv[++i] || "200", 10) || 0;
      else if (a === "-n") args.limit = parseInt(argv[++i] || "0", 10) || 0;
      else console.warn(`Unknown argument: ${a}`);
    }
  }
  // If no explicit input provided, use languages
  if (!args.input) {
    if (args.lang === "all") {
      args.inputs = [
        path.join("data", "en", "candos.json"),
        path.join("data", "ja", "candos.json"),
        path.join("data", "es", "candos.json"),
      ];
    } else {
      args.inputs = [path.join("data", args.lang, "candos.json")];
    }
  } else {
    args.inputs = [args.input];
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

function extractQuestionImages(candos) {
  const urls = new Set();
  for (const entry of candos) {
    if (!entry || !Array.isArray(entry.steps)) continue;
    const step1 = entry.steps.find((s) => s && s.id === "step1");
    if (!step1) continue;
    const imgs = step1.question?.images;
    if (Array.isArray(imgs)) {
      for (const u of imgs) {
        if (typeof u === "string" && u.trim()) urls.add(u.trim());
      }
    }
  }
  return Array.from(urls);
}

async function copyFileSafe(src, dest) {
  try {
    await ensureDir(path.dirname(dest));
    await fsp.copyFile(src, dest);
  } catch (e) {
    // If file exists and not forcing, ignore
    if (e && e.code === "EEXIST") return;
    // Re-throw for visibility
    throw e;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const outDir = path.resolve(args.outDir);
  const topicDir = path.resolve(args.topicDir);

  console.log(`[info] Output dir      : ${outDir}`);
  if (args.mirrorToTopic) console.log(`[info] Mirror to topic  : ${topicDir}`);
  console.log(`[info] Force overwrite : ${args.force}`);

  await ensureDir(outDir);
  if (args.mirrorToTopic) await ensureDir(topicDir);

  // Collect URLs across all inputs (languages)
  let allUrls = new Set();
  for (const input of args.inputs) {
    const inputPath = path.resolve(input);
    console.log(`[info] Reading         : ${inputPath}`);
    try {
      const candos = await readCandosJson(inputPath);
      const urls = extractQuestionImages(candos);
      urls.forEach((u) => allUrls.add(u));
    } catch (e) {
      console.warn(`[warn] Skip ${inputPath}: ${e.message}`);
    }
  }
  let urls = Array.from(allUrls);
  if (args.limit && args.limit > 0) urls = urls.slice(0, args.limit);
  console.log(`[info] Found ${urls.length} question image URLs.`);

  let success = 0,
    skipped = 0,
    failed = 0,
    mirrored = 0;
  const queue = urls.map((url) => ({ url }));

  console.log(
    `[info] Starting downloads (total ${queue.length}) concurrency=${args.concurrency}, retries=${args.retries}`
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
        if (args.mirrorToTopic) {
          const mirrorPath = path.join(topicDir, name);
          try {
            // If we didn't overwrite, ensure mirror exists too
            if (!args.force && fs.existsSync(mirrorPath)) {
              // already there
            } else {
              await fsp.copyFile(dest, mirrorPath);
              mirrored++;
              console.log(
                `[copy] ${name} -> ${path.relative(process.cwd(), mirrorPath)}`
              );
            }
          } catch (e) {
            console.warn(`[warn] mirror ${name}: ${e.message}`);
          }
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
    `[done] downloaded=${success}, skipped=${skipped}, mirrored=${mirrored}, failed=${failed}`
  );
  if (failed > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((e) => {
    console.error("[fatal]", e);
    process.exit(1);
  });
}
