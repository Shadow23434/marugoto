(function () {
  function pickText(node) {
    if (!node) return "";
    const first = node.querySelector("first")?.textContent || "";
    const second = node.querySelector("second")?.textContent || "";
    if (first || second) return (first + second).trim();
    return node.textContent?.trim() || "";
  }

  function parseCaptions(xmlDoc, mode) {
    // mode: 'renshu' for step1, 'challenge' for step2
    const selector =
      mode === "challenge" ? "challenge > video > cue" : "renshu > video > cue";
    const cues = Array.from(xmlDoc.querySelectorAll(selector));
    if (!cues.length) return [];
    const list = [];
    cues.forEach((cue, i) => {
      const time = parseFloat(cue.getAttribute("time")) || 0;
      const personRaw = cue.getAttribute("person") || "";
      const person = (personRaw || "m").toLowerCase();
      const ja = pickText(cue.querySelector("ja"));
      const ro = pickText(cue.querySelector("ro"));
      const en = pickText(cue.querySelector("en"));
      const es = pickText(cue.querySelector("es"));
      if (!(ja || ro || en || es)) return;
      const next = cues[i + 1];
      let end = time + 2;
      if (next) {
        const nextTime = parseFloat(next.getAttribute("time"));
        if (!isNaN(nextTime) && nextTime > time) end = nextTime - 0.01;
      }
      list.push({ start: time, end, j: ja, r: ro, e: en, es, person });
    });
    return list;
  }

  function deriveXmlUrls(videoEl, mode) {
    const mp4 = videoEl.querySelector("source.mp4");
    const src = mp4?.src || "";
    if (!src) return [];
    const basenameMatch = src.match(/([^/]+)\.(mp4|webm)(?:\?.*)?$/i);
    const basename = basenameMatch ? basenameMatch[1] : null;
    const urls = [];
    const remoteXml = src
      .replace("/movies/topics/", "/data/topics/")
      .replace(/\.(mp4|webm)(\?.*)?$/i, ".xml");
    // New local sources: step1/practice => assets/data/topics/cando, step2/challenge => assets/data/topics/challenge
    // New local sources:
    // - step1 (practice/renshu) => assets/data/topics/practice (primary), try /cando as fallback
    // - step2 (challenge)       => assets/data/topics/challenge
    const localDir =
      mode === "challenge"
        ? "assets/data/topics/challenge"
        : "assets/data/topics/practice";

    if (basename) {
      if (mode === "challenge") {
        urls.push(`assets/data/topics/challenge/${basename}.xml`);
      } else {
        urls.push(`assets/data/topics/practice/${basename}.xml`);
      }
    }
    urls.push(remoteXml);
    return [...new Set(urls)];
  }

  async function loadXml(videoEl, mode) {
    const candidates = deriveXmlUrls(videoEl, mode);
    let picked = null;
    let text = null;
    for (const url of candidates) {
      try {
        const r = await fetch(url);
        if (r.ok) {
          text = await r.text();
          picked = url;
          break;
        }
      } catch (_) {}
    }
    if (!text)
      throw new Error("Cannot load captions from: " + candidates.join(", "));
    return { text, picked };
  }

  function applySpeakerClass(container, person) {
    const wrap = container.querySelector(".speaker_wrap");
    if (!wrap) return;
    wrap.classList.remove("speaker_a", "speaker_b", "speaker_m");
    const cls =
      person === "a" || person === "b" ? `speaker_${person}` : "speaker_m";
    wrap.classList.add(cls);
  }

  function shouldShowForSpeaker(container, person) {
    if (person === "a" || person === "b") {
      const allowCaptions = container.classList.contains(`captions_${person}`);
      return allowCaptions;
    }
    return true;
  }

  function applyAutoMute(video, container, person, mode) {
    if (mode !== "renshu") return;
    if (video.__userMuted) return;
    let allowAudio = true;
    if (person === "a" || person === "b") {
      allowAudio = container.classList.contains(`voice_${person}`);
    }
    const shouldMute = !allowAudio;
    if (video.__autoMuted !== shouldMute) {
      video.__autoMuteActive = true;
      video.muted = shouldMute;
      video.__autoMuted = shouldMute;
      setTimeout(() => (video.__autoMuteActive = false), 0);
    }
  }

  function setupLanguageActivator(containerId, ids) {
    // Create compatible activator functions used by inline HTML
    const container = document.getElementById(containerId);
    return function activator(prefix, key, visible) {
      if (!container) return;
      if (prefix === "language_") {
        const elId = ids[key];
        if (elId) {
          const el = document.getElementById(elId);
          if (el) {
            el.style.display = visible ? "block" : "none";
            el.setAttribute("aria-hidden", visible ? "false" : "true");
          }
        }
      }
      const cls = `${prefix}${key}`;
      if (visible) container.classList.add(cls);
      else container.classList.remove(cls);
    };
  }

  async function initCaptions({
    videoSelector,
    containerSelector,
    ids, // { j: 'language_1', r: 'language_2', e: 'language_3' } or c-variants
    languageInputsSelector, // scope to read initial checkboxes
    mode, // 'renshu' | 'challenge'
    exposeName, // global getter name e.g. getStep1Captions / getStep2Captions
    activatorName, // window function name e.g. activator / activator2
  }) {
    const video = document.querySelector(videoSelector);
    const container = document.querySelector(containerSelector);
    if (!video || !container) return;

    // Expose activator used by inline onclick handlers
    const activatorFn = setupLanguageActivator(container.id, ids);
    window[activatorName] = activatorFn;

    const captionEls = {
      j: document.getElementById(ids.j),
      r: document.getElementById(ids.r),
      e: document.getElementById(ids.e),
    };

    try {
      const { text, picked } = await loadXml(video, mode);
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");
      const parserError = xml.querySelector("parsererror");
      if (parserError)
        throw new Error("XML parse error: " + parserError.textContent);
      const captions = parseCaptions(xml, mode);
      if (!captions.length) {
        container.innerHTML = "<p>No captions found.</p>";
        return;
      }
      window[exposeName] = () => captions;
      console.log(
        `[captions] Loaded ${captions.length} cues from ${picked} (${mode})`
      );

      // Track user mute actions (so we don't fight the user)
      video.addEventListener("volumechange", () => {
        if (video.__autoMuteActive) return;
        video.__userMuted = video.muted;
        if (video.__userMuted) video.__autoMuted = undefined;
      });

      const handler = () => {
        const t = video.currentTime;
        const current = captions.find((c) => t >= c.start && t <= c.end);
        if (current) {
          video.__lastCuePerson = current.person;
          const visible = shouldShowForSpeaker(container, current.person);
          if (visible) {
            if (captionEls.j) captionEls.j.textContent = current.j;
            if (captionEls.r) captionEls.r.textContent = current.r;
            if (captionEls.e) captionEls.e.textContent = current.e;
          } else {
            if (captionEls.j) captionEls.j.textContent = "";
            if (captionEls.r) captionEls.r.textContent = "";
            if (captionEls.e) captionEls.e.textContent = "";
          }
          applySpeakerClass(container, current.person);
          applyAutoMute(video, container, current.person, mode);
        } else {
          if (captionEls.j) captionEls.j.textContent = "";
          if (captionEls.r) captionEls.r.textContent = "";
          if (captionEls.e) captionEls.e.textContent = "";
        }
      };
      // Keep a reference for later replacement on source change
      const prev = video.__captionsUpdateHandler;
      if (prev) video.removeEventListener("timeupdate", prev);
      video.addEventListener("timeupdate", handler);
      video.__captionsUpdateHandler = handler;

      // When a voice control checkbox changes, re-apply mute immediately (step1 only)
      if (mode === "renshu") {
        const voiceInputs = document.querySelectorAll(
          "#step1 .cando_movie_navi input[name='words']"
        );
        const recalc = () => {
          if (video.__lastCuePerson)
            applyAutoMute(video, container, video.__lastCuePerson, mode);
        };
        voiceInputs.forEach((inp) => {
          inp.addEventListener("change", recalc);
          inp.addEventListener("click", () => setTimeout(recalc, 0));
        });
      }

      // Initialize language visibility based on checkboxes or container classes
      const inputs = document.querySelectorAll(languageInputsSelector);
      if (inputs.length) {
        inputs.forEach((inp) => {
          const key = { 1: "j", 2: "r", 3: "e" }[inp.value];
          if (key) activatorFn("language_", key, inp.checked);
        });
      } else {
        ["j", "r", "e"].forEach((k) => {
          activatorFn(
            "language_",
            k,
            container.classList.contains(`language_${k}`)
          );
        });
      }
    } catch (err) {
      console.error("[captions] Error:", err);
      container.innerHTML =
        "<p style='color:red;'>Failed to load captions.</p>";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const initAll = () => {
      // Avoid redundant re-initialization if nothing exists yet
      // Step1 (Practice)
      initCaptions({
        videoSelector: "#video",
        containerSelector: "#step1_captions",
        ids: { j: "language_1", r: "language_2", e: "language_3" },
        languageInputsSelector:
          "#step1 .cando_movie_navi .language input[name='language']",
        mode: "renshu",
        exposeName: "getStep1Captions",
        activatorName: "activator",
      });

      // Step2 (Challenge)
      initCaptions({
        videoSelector: "#video2",
        containerSelector: "#step2_captions",
        ids: { j: "language_c1", r: "language_c2", e: "language_c3" },
        languageInputsSelector:
          "#step2 .cando_movie_navi .language input[name='language']",
        mode: "challenge",
        exposeName: "getStep2Captions",
        activatorName: "activator2",
      });
    };

    initAll();

    // Re-run after dynamic render completes
    document.addEventListener("canDo:rendered", initAll);

    // Listen for video changes (e.g., when user clicks thumbnails) and reload captions
    document.addEventListener("canDo:videoChanged", async (ev) => {
      try {
        const detail = ev.detail || {};
        const video = detail.video || document.querySelector("#video");
        const mode = detail.mode || "renshu";
        if (!video) return;

        const container =
          mode === "challenge"
            ? document.querySelector("#step2_captions")
            : document.querySelector("#step1_captions");
        if (!container) return;

        const ids =
          mode === "challenge"
            ? { j: "language_c1", r: "language_c2", e: "language_c3" }
            : { j: "language_1", r: "language_2", e: "language_3" };

        const { text } = await loadXml(video, mode);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const captions = parseCaptions(xml, mode);
        if (!captions.length) return;

        const captionEls = {
          j: document.getElementById(ids.j),
          r: document.getElementById(ids.r),
          e: document.getElementById(ids.e),
        };

        // Update the public getter
        if (mode === "challenge") {
          window.getStep2Captions = () => captions;
        } else {
          window.getStep1Captions = () => captions;
        }

        // Replace previous timeupdate handler if any
        const prev = video.__captionsUpdateHandler;
        if (prev) video.removeEventListener("timeupdate", prev);
        // Track user mute on the (potentially) new video element
        video.addEventListener("volumechange", () => {
          if (video.__autoMuteActive) return;
          video.__userMuted = video.muted;
          if (video.__userMuted) video.__autoMuted = undefined;
        });

        const handler = () => {
          const t = video.currentTime;
          const current = captions.find((c) => t >= c.start && t <= c.end);
          if (current) {
            video.__lastCuePerson = current.person;
            const visible = shouldShowForSpeaker(container, current.person);
            if (visible) {
              if (captionEls.j) captionEls.j.textContent = current.j;
              if (captionEls.r) captionEls.r.textContent = current.r;
              if (captionEls.e) captionEls.e.textContent = current.e;
            } else {
              if (captionEls.j) captionEls.j.textContent = "";
              if (captionEls.r) captionEls.r.textContent = "";
              if (captionEls.e) captionEls.e.textContent = "";
            }
            applySpeakerClass(container, current.person);
            applyAutoMute(video, container, current.person, mode);
          } else {
            if (captionEls.j) captionEls.j.textContent = "";
            if (captionEls.r) captionEls.r.textContent = "";
            if (captionEls.e) captionEls.e.textContent = "";
          }
        };
        video.addEventListener("timeupdate", handler);
        video.__captionsUpdateHandler = handler;

        if (mode === "renshu") {
          const voiceInputs = document.querySelectorAll(
            "#step1 .cando_movie_navi input[name='words']"
          );
          const recalc = () => {
            if (video.__lastCuePerson)
              applyAutoMute(video, container, video.__lastCuePerson, mode);
          };
          voiceInputs.forEach((inp) => {
            inp.addEventListener("change", recalc);
          });
        }
      } catch (e) {
        console.error("[captions] reload error", e);
      }
    });
  });
})();
