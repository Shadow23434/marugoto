#!/usr/bin/env node
/**
 * Download all hiragana stroke-order animations referenced in hiragana.json
 * (animation.{mp4Url, webmUrl}).
 *
 * Source fields:
 *   - (data/<lang>/hiragana.json).groups[*].characters[*].animation.{mp4Url, webmUrl}
 *
 * Default output:
 *   assets/movies/hiragana/animation/mp4/<filename>.mp4
 *   assets/movies/hiragana/animation/webm/<filename>.webm
 *
 * Usage (PowerShell on Windows):
 *   node scripts/download-hiragana-animations.js                   # en by default
 *   node scripts/download-hiragana-animations.js --lang en         # explicit language
 *   node scripts/download-hiragana-animations.js --lang all        # merge en+ja+es
 *   node scripts/download-hiragana-animations.js --input data/en/hiragana.json
 *   node scripts/download-hiragana-animations.js --outDir assets/movies/hiragana/animation
 *   node scripts/download-hiragana-animations.js --format mp4      # only mp4
 *   node scripts/download-hiragana-animations.js --limit 10        # first 10 only
 *   node scripts/download-hiragana-animations.js --force           # overwrite
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const http = require("http");
const https = require("https");

function parseArgs(argv) {
  const args = {
    lang: "en", // en|ja|es|all
    input: undefined,
    outDir: path.join("assets", "movies", "hiragana", "animation"),
    force: false,
    concurrency: 4,
    retries: 2,
    delay: 200,
    format: "both", // mp4|webm|both
    limit: 0, // 0 = no limit
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force" || a === "-f") args.force = true;
    else if (a === "--lang" || a === "-l") args.lang = argv[++i] || "en";
    else if (a === "--input" || a === "-i") args.input = argv[++i];
    else if (a === "--outDir" || a === "-o") args.outDir = argv[++i];
    else if (a === "--concurrency" || a === "-c")
      args.concurrency = parseInt(argv[++i] || "4", 10) || 4;
    else if (a === "--retries" || a === "-r")
      args.retries = parseInt(argv[++i] || "2", 10) || 2;
    else if (a === "--delay" || a === "-d")
      args.delay = parseInt(argv[++i] || "200", 10) || 0;
    else if (a === "--format")
      args.format = (argv[++i] || "both").toLowerCase();
    else if (a === "--limit" || a === "-n")
      args.limit = parseInt(argv[++i] || "0", 10) || 0;
    else console.warn(`Unknown argument: ${a}`);
  }
  if (!args.input) {
    if (args.lang === "all") {
      args.inputs = [
        path.join("data", "en", "hiragana.json"),
        path.join("data", "ja", "hiragana.json"),
        path.join("data", "es", "hiragana.json"),
      ];
    } else {
      args.inputs = [path.join("data", args.lang, "hiragana.json")];
    }
  } else {
    args.inputs = [args.input];
  }
  if (!["mp4", "webm", "both"].includes(args.format)) args.format = "both";
  return args;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
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
    Accept: "video/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.8,ja;q=0.6,es;q=0.6",
    Referer: referer,
    Connection: "keep-alive",
  };
}

function basenameFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return path.basename(u.pathname);
  } catch (e) {
    return path.basename(urlStr);
  }
}

function downloadToFile(
  urlStr,
  destPath,
  { maxRedirects = 5, force = false, attempt = 0, retries = 0 } = {}
) {
  return new Promise((resolve, reject) => {
    const doDownload = (currentUrl, redirectsLeft) => {
      const client = selectableClient(currentUrl);
      const headers = buildHeaders(currentUrl);
      const req = client.get(currentUrl, { headers }, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (redirectsLeft <= 0)
            return reject(new Error(`Too many redirects for ${currentUrl}`));
          const next = new URL(res.headers.location, currentUrl).href;
          res.resume();
          return doDownload(next, redirectsLeft - 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          if (
            [403, 429, 500, 502, 503].includes(res.statusCode) &&
            attempt < retries
          ) {
            const wait = 700 + attempt * 600;
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
        const tmp = destPath + ".tmp";
        const out = fs.createWriteStream(tmp);
        res.pipe(out);
        out.on("finish", () => {
          out.close(async () => {
            try {
              await fsp.rename(tmp, destPath);
              resolve({ url: currentUrl, path: destPath });
            } catch (err) {
              reject(err);
            }
          });
        });
        out.on("error", (err) => {
          res.destroy();
          reject(err);
        });
      });
      req.on("error", (err) => reject(err));
      req.setTimeout(60_000, () =>
        req.destroy(new Error(`Timeout fetching ${currentUrl}`))
      );
    };

    if (!force && fs.existsSync(destPath))
      return resolve({ url: urlStr, path: destPath, skipped: true });
    doDownload(urlStr, maxRedirects);
  });
}

async function readHiraganaJson(jsonPath) {
  const raw = await fsp.readFile(jsonPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON at ${jsonPath}: ${e.message}`);
  }
}

function extractAnimationUrls(hiraganaJson) {
  const mp4 = new Set();
  const webm = new Set();
  const groups = Array.isArray(hiraganaJson.groups) ? hiraganaJson.groups : [];
  for (const g of groups) {
    const chars = Array.isArray(g.characters) ? g.characters : [];
    for (const ch of chars) {
      if (!ch || !ch.animation) continue;
      const m = ch.animation.mp4Url;
      const w = ch.animation.webmUrl;
      if (typeof m === "string" && m.trim()) mp4.add(m.trim());
      if (typeof w === "string" && w.trim()) webm.add(w.trim());
    }
  }
  return { mp4: Array.from(mp4), webm: Array.from(webm) };
}

async function main() {
  const args = parseArgs(process.argv);
  const outBase = path.resolve(args.outDir);
  const outMp4 = path.join(outBase, "mp4");
  const outWebm = path.join(outBase, "webm");

  console.log(`[info] Output dir : ${outBase}`);
  console.log(`[info] Formats    : ${args.format}`);
  console.log(`[info] Force      : ${args.force}`);

  if (args.format === "mp4" || args.format === "both") await ensureDir(outMp4);
  if (args.format === "webm" || args.format === "both")
    await ensureDir(outWebm);

  // Collect URLs across all inputs (languages)
  let allMp4 = new Set();
  let allWebm = new Set();
  for (const input of args.inputs) {
    const inputPath = path.resolve(input);
    console.log(`[info] Reading     : ${inputPath}`);
    try {
      const hira = await readHiraganaJson(inputPath);
      const { mp4, webm } = extractAnimationUrls(hira);
      mp4.forEach((u) => allMp4.add(u));
      webm.forEach((u) => allWebm.add(u));
    } catch (e) {
      console.warn(`[warn] Skip ${inputPath}: ${e.message}`);
    }
  }

  let tasks = [];
  if (args.format === "mp4" || args.format === "both") {
    tasks.push(...Array.from(allMp4).map((url) => ({ url, type: "mp4" })));
  }
  if (args.format === "webm" || args.format === "both") {
    tasks.push(...Array.from(allWebm).map((url) => ({ url, type: "webm" })));
  }

  if (args.limit && args.limit > 0) tasks = tasks.slice(0, args.limit);

  console.log(
    `[info] Queued ${tasks.length} downloads (mp4=${allMp4.size}, webm=${allWebm.size}).`
  );
  console.log(
    `[info] Concurrency=${args.concurrency}, Retries=${args.retries}`
  );

  let success = 0,
    skipped = 0,
    failed = 0;

  async function worker(id) {
    while (tasks.length) {
      const item = tasks.shift();
      if (!item) break;
      const name = basenameFromUrl(item.url);
      const destDir = item.type === "mp4" ? outMp4 : outWebm;
      const dest = path.join(destDir, name);
      try {
        const r = await downloadToFile(item.url, dest, {
          force: args.force,
          retries: args.retries,
        });
        if (r.skipped) {
          skipped++;
          console.log(`[skip] ${item.type} ${name}`);
        } else {
          success++;
          console.log(`[ok]   ${item.type} ${name}`);
        }
      } catch (e) {
        failed++;
        console.warn(`[fail] ${item.type} ${name}: ${e.message}`);
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
    console.error("[fatal]", e);
    process.exit(1);
  });
}
