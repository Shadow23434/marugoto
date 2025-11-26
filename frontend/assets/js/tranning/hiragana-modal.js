(function () {
  "use strict";

  const PAGE_SCOPE = document.querySelector("main#hiragana");
  if (!PAGE_SCOPE) return;

  const JSON_URL = "data/en/hiragana.json";
  const SELECTOR_TRIGGER = "#hiragana .char_list a.inline_modal";
  const MODAL_ID = "character_modal";

  let modal = document.getElementById(MODAL_ID);
  if (!modal) {
    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("tabindex", "-1");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "modal-close-btn";
    closeBtn.setAttribute("aria-label", "Close dialog");
    closeBtn.innerHTML = '<span aria-hidden="true">×</span>';

    const content = document.createElement("div");
    content.className = "detail_inner";

    modal.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  let overlay = null;
  let lastFocused = null;

  // Resolve remote vocab image URL to local path under assets/images/hiragana/vocabularies
  function localVocabImgPath(remoteUrl) {
    if (!remoteUrl) return "";
    let base = "";
    try {
      const u = new URL(remoteUrl, window.location.href);
      base = (u.pathname.split("/").pop() || "").split("?")[0];
    } catch (_) {
      base = (remoteUrl.split("/").pop() || "").split("?")[0];
    }
    if (!base) return "";
    return `assets/images/hiragana/vocabularies/${base}`;
  }

  // Resolve remote stroke order image URL to local path under assets/images/hiragana/order
  function localOrderImgPath(remoteUrl) {
    if (!remoteUrl) return "";
    let base = "";
    try {
      const u = new URL(remoteUrl, window.location.href);
      base = (u.pathname.split("/").pop() || "").split("?")[0];
    } catch (_) {
      base = (remoteUrl.split("/").pop() || "").split("?")[0];
    }
    if (!base) return "";
    return `assets/images/hiragana/order/${base}`;
  }

  function getFocusable() {
    return Array.from(
      modal.querySelectorAll(
        "[href], button, input, select, textarea, [tabindex]"
      )
    ).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.tabIndex !== -1 &&
        el.offsetParent !== null
    );
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    if (!focusable.length) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onGlobalKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  }

  function openModal() {
    if (modal.classList.contains("is-open")) return;
    lastFocused = document.activeElement;
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.addEventListener("click", closeModal);
    document.body.appendChild(overlay);
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modal.addEventListener("keydown", trapFocus);
    document.addEventListener("keydown", onGlobalKey);
    const focusable = getFocusable();
    (focusable[0] || modal).focus();
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    modal.removeEventListener("keydown", trapFocus);
    document.removeEventListener("keydown", onGlobalKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    // Stop any playing media inside modal
    modal.querySelectorAll("audio, video").forEach((m) => {
      try {
        m.pause();
      } catch (_) {}
    });
  }

  modal
    .querySelector(".modal-close-btn")
    ?.addEventListener("click", closeModal);

  let dataPromise = null;
  function getData() {
    if (!dataPromise) {
      dataPromise = fetch(JSON_URL).then((r) => {
        if (!r.ok) throw new Error("Failed to load hiragana.json");
        return r.json();
      });
    }
    return dataPromise;
  }

  function extractRowChars(allGroups, rowKey) {
    // Find characters matching rowName == rowKey across groups
    const result = [];
    allGroups.forEach((g) => {
      if (!Array.isArray(g.characters)) return;
      g.characters.forEach((ch) => {
        if (ch.rowName === rowKey) result.push(ch);
      });
    });
    return result;
  }

  function buildVocabHTML(vocabularies) {
    if (!Array.isArray(vocabularies) || vocabularies.length === 0) return "";
    const items = vocabularies
      .map((v, idx) => {
        const img = localVocabImgPath(
          v.vocabImgUrl || v.imageUrl || v.image || ""
        );
        const kana = v.vocabWord || v.kana || v.kanaText || "";
        const romaji = v.vocabRomaji || v.romaji || v.romajiText || "";
        const meaning =
          v.vocabMeaning || v.meaning || v.meaningEn || v.en || "";
        const audio = v.vocabAudioUrl || v.audio || v.audioUrl || "";
        return `
        <div class="detail" role="option" data-slick-index="${idx}">
          <div class="image"><img src="${img}" alt=""></div>
          <span><em>${kana}</em>
            <button type="button" class="js-audio-btn"><img src="assets/images/common/icon_sounds.png" alt=""></button>
            <audio preload="none">${
              audio ? `<source src="${audio}" type="audio/mp3">` : ""
            }</audio>
          </span>
          <i>${romaji}</i>${meaning || ""}
        </div>`;
      })
      .join("");

    return `
      <div class="detail_vocab">
        <strong>VOCABULARIES</strong>
        <div class="vocab">
          <div class="vocabularies" role="listbox">${items}</div>
        </div>
      </div>`;
  }

  function wireAudio(container) {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".js-audio-btn");
      if (!btn) return;
      const wrap = btn.closest(".detail_summary, .detail, .hm-roman");
      const audio = wrap ? wrap.querySelector("audio") : null;
      if (!audio) return;
      // Stop any other audio
      container.querySelectorAll("audio").forEach((a) => {
        if (a !== audio) {
          try {
            a.pause();
            a.currentTime = 0;
          } catch (_) {}
        }
      });
      try {
        if (!audio.paused) {
          audio.currentTime = 0;
        } else {
          audio.play();
        }
      } catch (err) {
        console.warn("Audio play failed", err);
      }
    });
  }

  function renderCharacter(container, rowChars, activeIndex) {
    const ch = rowChars[activeIndex];
    const vocab = Array.isArray(ch.vocabularies) ? ch.vocabularies : [];
    const romaji = (ch.romaji || "").toLowerCase();
    const mp4 = romaji
      ? `assets/movies/hiragana/animation/mp4/${romaji}.mp4`
      : "";
    const webm = romaji
      ? `assets/movies/hiragana/animation/webm/${romaji}.webm`
      : "";
    const audioFile = ch.audio
      ? ch.audio.split("/").pop() || ""
      : romaji
      ? `${romaji}.mp3`
      : "";
    const localCharAudio = audioFile ? `assets/sounds/common/${audioFile}` : "";

    const practiceSquares = ch.orderImgUrl
      ? `<img src="${localOrderImgPath(
          ch.orderImgUrl
        )}" alt="Stroke order for ${ch.characterName}" class="hm-orderimg">`
      : "";

    const slides = vocab
      .map((v) => {
        const img = localVocabImgPath(
          v.vocabImgUrl || v.imageUrl || v.image || ""
        );
        const kana = v.vocabWord || v.kana || v.kanaText || "";
        const romaji = v.vocabRomaji || v.romaji || v.romajiText || "";
        const meaning =
          v.vocabMeaning || v.meaning || v.meaningEn || v.en || "";
        const audio = v.vocabAudioUrl || v.audio || v.audioUrl || "";
        return `
          <div class="slide">
            <div class="image"><img src="${img}" alt=""></div>
            <div class="caption">
              <span><em>${kana}</em>
                <button type="button" class="js-audio-btn"><img src="assets/images/common/icon_sounds.png" alt=""></button>
                <audio preload="none">${
                  audio ? `<source src="${audio}" type="audio/mp3">` : ""
                }</audio>
              </span>
              <i>${romaji}</i>
              <div class="meaning">${meaning}</div>
            </div>
          </div>`;
      })
      .join("");

    const rowTabs = rowChars
      .map(
        (c, i) =>
          `<button type="button" class="js-rowtab ${
            i === activeIndex ? "is-active" : ""
          }" data-idx="${i}">${c.characterName || ""}</button>`
      )
      .join("");

    const html = `
      <div class="hm-grid">
        <div class="hm-left">
          <div class="hm-glyph">${ch.characterName || ""}</div>
          <div class="hm-roman">
            <span class="roman">${ch.romaji || ""}</span>
            <button type="button" class="hm-sound js-audio-btn"><img src="assets/images/common/icon_sounds.png" alt=""></button>
            <audio preload="none">${
              localCharAudio
                ? `<source src="${localCharAudio}" type="audio/mp3">`
                : ""
            }</audio>
          </div>
          <div class="hm-practice">${practiceSquares}</div>
        </div>
        <div class="hm-anim">
          <strong>ANIMATION</strong>
          <div class="anim-box">
            <button type="button" class="hm-play" aria-label="Play animation">▶</button>
            <video class="hm-video" playsinline webkit-playsinline preload="none">${
              mp4 ? `<source src="${mp4}" type="video/mp4">` : ""
            }${webm ? `<source src="${webm}" type="video/webm">` : ""}</video>
          </div>
        </div>
        <div class="hm-vocab">
          <strong>VOCABULARIES</strong>
          <div class="hm-slider" data-count="${vocab.length}">
            <button type="button" class="prev" aria-label="Previous">❮</button>
            <div class="viewport"><div class="track">${slides}</div></div>
            <button type="button" class="next" aria-label="Next">❯</button>
          </div>
        </div>
      </div>
      <div class="hm-rowtabs">${rowTabs}</div>`;

    container.innerHTML = html;

    // Wire play overlay
    const playBtn = container.querySelector(".hm-play");
    const video = container.querySelector(".hm-video");
    if (playBtn && video) {
      playBtn.addEventListener("click", () => {
        playBtn.style.display = "none";
        video.classList.add("is-playing");
        try {
          video.play();
        } catch (_) {}
      });
    }

    // Wire slider
    setupSlider(container.querySelector(".hm-slider"));

    // Wire audio buttons inside this render
    wireAudio(container);
  }

  function setupSlider(slider) {
    if (!slider) return;
    const track = slider.querySelector(".track");
    const viewport = slider.querySelector(".viewport");
    const prev = slider.querySelector(".prev");
    const next = slider.querySelector(".next");
    const slides = Array.from(slider.querySelectorAll(".slide"));
    let idx = 0;

    function update() {
      const w = viewport.clientWidth;
      track.style.transform = `translateX(-${idx * w}px)`;
      prev.disabled = idx <= 0;
      next.disabled = idx >= slides.length - 1;
      slides.forEach((s) => (s.style.width = w + "px"));
    }

    const ro = new ResizeObserver(update);
    ro.observe(viewport);

    prev.addEventListener("click", () => {
      if (idx > 0) {
        idx -= 1;
        update();
      }
    });
    next.addEventListener("click", () => {
      if (idx < slides.length - 1) {
        idx += 1;
        update();
      }
    });

    update();
  }

  // Click handler on character tiles
  document.addEventListener("click", async (ev) => {
    const a = ev.target.closest(SELECTOR_TRIGGER);
    if (!a) return;
    ev.preventDefault();

    // Derive row key from href "#detail_column_{row}"
    const href = a.getAttribute("href") || "";
    const m = href.match(/#detail_column_([a-z0-9_]+)/i);
    if (!m) return;
    const rowKey = m[1];

    try {
      const json = await getData();
      const groups = Array.isArray(json.groups) ? json.groups : [];
      const rowChars = extractRowChars(groups, rowKey);
      if (!rowChars.length) {
        console.warn("No characters found for row", rowKey);
        return;
      }

      const inner = modal.querySelector(".detail_inner");
      // Determine which character in the row was clicked (index among siblings)
      let initialIndex = 0;
      const clickedItem = a.closest("li");
      if (clickedItem && clickedItem.parentElement) {
        const siblings = Array.from(clickedItem.parentElement.children).filter(
          (el) => el.tagName && el.tagName.toLowerCase() === "li"
        );
        const found = siblings.indexOf(clickedItem);
        if (found >= 0 && found < rowChars.length) initialIndex = found;
      }

      // Render the clicked character view first
      renderCharacter(inner, rowChars, initialIndex);

      // Switch characters via bottom tabs
      inner.addEventListener("click", function (e) {
        const btn = e.target.closest(".js-rowtab");
        if (!btn) return;
        const idx = parseInt(btn.getAttribute("data-idx"), 10) || 0;
        renderCharacter(inner, rowChars, idx);
      });

      openModal();
    } catch (err) {
      console.error(err);
    }
  });
})();
