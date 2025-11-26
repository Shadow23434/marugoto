(function () {
  "use strict";

  const hiraganaContainer = document.querySelector("main#hiragana");
  const katakanaContainer = document.querySelector("main#katakana");

  if (!hiraganaContainer && !katakanaContainer) return;

  const KANA_TYPE = hiraganaContainer ? "hiragana" : "katakana";
  const CONTAINER_ID = hiraganaContainer ? "#hiragana" : "#katakana";

  const SELECTOR_TRIGGER = `${CONTAINER_ID} .char_list a.inline_modal`;
  const MODAL_ID = "character_modal";

  let modal = document.getElementById(MODAL_ID);
  let overlay = null;
  let lastFocused = null;

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

  function extractRowChars(allGroups, rowKey) {
    const result = [];
    if (!Array.isArray(allGroups)) return result;

    allGroups.forEach((g) => {
      if (!Array.isArray(g.characters)) return;
      g.characters.forEach((ch) => {
        const chRow = (ch.rowName || "").split(" ")[0];
        if (chRow === rowKey) {
          result.push(ch);
        }
      });
    });
    return result;
  }

  function renderCharacter(container, rowChars, activeIndex) {
    const ch = rowChars[activeIndex];
    if (!ch) return;

    const vocab = Array.isArray(ch.vocabularies) ? ch.vocabularies : [];
    const romaji = (ch.romaji || "").toLowerCase();

    const charAudioUrl = ch.audio || "";

    const practiceSquares = ch.orderImgUrl
      ? `<img src="${ch.orderImgUrl}" alt="Stroke order for ${ch.characterName}" class="hm-orderimg">`
      : "";

    const mp4 = romaji
      ? `assets/movies/${KANA_TYPE}/animation/mp4/${romaji}.mp4`
      : "";
    const webm = romaji
      ? `assets/movies/${KANA_TYPE}/animation/webm/${romaji}.webm`
      : "";

    const slidesHTML = vocab
      .map((v) => {
        const imgUrl = v.vocabImgUrl || "assets/images/common/no-image.png";
        const audioUrl = v.vocabAudioUrl || "";
        const kana = v.vocabWord || v.kana || "";
        const vRomaji = v.vocabRomaji || v.romaji || "";
        const meaning = v.vocabMeaning || v.meaning || "";

        return `
        <div class="slide">
          <div class="image">
            <img src="${imgUrl}" alt="${kana}" loading="lazy">
          </div>
          <div class="caption">
            <span>
                <em>${kana}</em>
                ${
                  audioUrl
                    ? `
                <button type="button" class="js-audio-btn">
                    <img src="assets/images/common/icon_sounds.png" alt="Play Sound">
                </button>
                <audio preload="none">
                    <source src="${audioUrl}" type="audio/mp3">
                </audio>
                `
                    : ""
                }
            </span>
            <i>${vRomaji}</i>
            <div class="meaning">${meaning}</div>
          </div>
        </div>`;
      })
      .join("");

    const rowTabsHTML = rowChars
      .map(
        (c, i) =>
          `<button type="button" class="js-rowtab ${
            i === activeIndex ? "is-active" : ""
          }" data-idx="${i}">
        ${c.characterName || ""}
      </button>`
      )
      .join("");

    const template = `
      <div class="hm-grid">
        <div class="hm-left">
          <div class="hm-glyph">${ch.characterName || ""}</div>
          <div class="hm-roman">
            <span class="roman">${ch.romaji || ""}</span>
            ${
              charAudioUrl
                ? `
            <button type="button" class="hm-sound js-audio-btn">
                <img src="assets/images/common/icon_sounds.png" alt="Play Sound">
            </button>
            <audio preload="none">
                <source src="${charAudioUrl}" type="audio/mp3">
            </audio>
            `
                : ""
            }
          </div>
          <div class="hm-practice">${practiceSquares}</div>
        </div>

        <div class="hm-anim">
          <strong>ANIMATION</strong>
          <div class="anim-box">
            <button type="button" class="hm-play" aria-label="Play animation">▶</button>
            <video class="hm-video" playsinline webkit-playsinline preload="none">
              ${mp4 ? `<source src="${mp4}" type="video/mp4">` : ""}
              ${webm ? `<source src="${webm}" type="video/webm">` : ""}
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <div class="hm-vocab">
          <strong>VOCABULARIES</strong>
          <div class="hm-slider" data-count="${vocab.length}">
            <button type="button" class="prev" aria-label="Previous" disabled>❮</button>
            <div class="viewport">
                <div class="track">
                    ${
                      slidesHTML ||
                      '<div class="p-3 text-muted text-center" style="width:100%">No vocabularies</div>'
                    }
                </div>
            </div>
            <button type="button" class="next" aria-label="Next" ${
              vocab.length <= 1 ? "disabled" : ""
            }>❯</button>
          </div>
        </div>
      </div>

      <div class="hm-rowtabs">${rowTabsHTML}</div>`;

    container.innerHTML = template;

    initVideoPlayer(container);
    initSlider(container.querySelector(".hm-slider"));
  }

  function initVideoPlayer(container) {
    const playBtn = container.querySelector(".hm-play");
    const video = container.querySelector(".hm-video");
    if (playBtn && video) {
      playBtn.addEventListener("click", () => {
        playBtn.style.display = "none";
        video.classList.add("is-playing");
        video.play().catch((e) => console.warn("Video play error:", e));
      });

      video.addEventListener("ended", () => {
        playBtn.style.display = "block";
        video.classList.remove("is-playing");
      });
    }
  }

  function initSlider(slider) {
    if (!slider) return;
    const track = slider.querySelector(".track");
    const viewport = slider.querySelector(".viewport");
    const prev = slider.querySelector(".prev");
    const next = slider.querySelector(".next");
    const slides = Array.from(slider.querySelectorAll(".slide"));

    if (slides.length === 0) return;

    let idx = 0;

    function update() {
      const w = viewport.clientWidth;
      track.style.transform = `translateX(-${idx * w}px)`;

      if (prev) prev.disabled = idx <= 0;
      if (next) next.disabled = idx >= slides.length - 1;

      slides.forEach((s) => (s.style.width = w + "px"));
    }

    const ro = new ResizeObserver(() => {
      update();
    });
    ro.observe(viewport);

    if (prev) {
      prev.addEventListener("click", () => {
        if (idx > 0) {
          idx -= 1;
          update();
        }
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        if (idx < slides.length - 1) {
          idx += 1;
          update();
        }
      });
    }

    setTimeout(update, 50);
  }

  function openModal() {
    if (modal.classList.contains("is-open")) return;

    lastFocused = document.activeElement;
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.addEventListener("click", closeModal);
    document.body.appendChild(overlay);

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden"; // Chặn scroll body

    modal.addEventListener("keydown", trapFocus);
    document.addEventListener("keydown", onGlobalKey);

    // Focus vào modal để hỗ trợ accessibility
    modal.focus();
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    document.body.style.overflow = ""; // Bỏ chặn scroll

    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    modal.removeEventListener("keydown", trapFocus);
    document.removeEventListener("keydown", onGlobalKey);

    // Trả focus về phần tử trước đó
    if (lastFocused && lastFocused.focus) lastFocused.focus();

    // Dừng toàn bộ media đang chạy trong modal
    stopAllMedia(modal);
  }

  function stopAllMedia(scope) {
    scope.querySelectorAll("audio, video").forEach((m) => {
      try {
        m.pause();
        m.currentTime = 0;
      } catch (_) {}
    });
  }

  // Accessibility: Giữ tab focus bên trong modal
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      modal.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
    );
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

  // Gắn sự kiện đóng cho nút X
  modal
    .querySelector(".modal-close-btn")
    ?.addEventListener("click", closeModal);

  // Xử lý click mở Modal
  document.addEventListener("click", async (ev) => {
    const a = ev.target.closest(SELECTOR_TRIGGER);

    // Nếu click vào thẻ <a> mở modal
    if (a) {
      ev.preventDefault();
      await handleOpenModalRequest(a);
      return;
    }

    // Nếu click vào nút Audio (Play sound) bên trong Modal
    const audioBtn = ev.target.closest(".js-audio-btn");
    if (audioBtn && modal.contains(audioBtn)) {
      handleAudioClick(audioBtn);
      return;
    }
  });

  // Xử lý sự kiện click bên trong nội dung modal (cho các tabs chuyển ký tự)
  // Ta gắn trực tiếp vào .detail_inner để dễ quản lý scope
  const detailInner = modal.querySelector(".detail_inner");
  detailInner.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".js-rowtab");
    if (tabBtn) {
      const activeIdx = parseInt(tabBtn.getAttribute("data-idx"), 10) || 0;
      const currentRowKey = detailInner.getAttribute("data-current-row");
      if (currentRowKey) {
        reloadModalContent(currentRowKey, activeIdx);
      }
    }
  });

  // Logic mở modal
  async function handleOpenModalRequest(anchorElement) {
    const href = anchorElement.getAttribute("href") || "";
    // href dạng "#detail_column_ka" -> lấy "ka"
    const match = href.match(/#detail_column_([a-z0-9_]+)/i);
    if (!match) return;

    const rowKey = match[1];

    try {
      // 1. Lấy dữ liệu từ KanaService (Có Cache)
      if (typeof KanaService === "undefined") {
        throw new Error(
          "KanaService is not loaded. Please check scripts order."
        );
      }
      const data = await KanaService.getData(KANA_TYPE);

      // 2. Lọc ra các ký tự của hàng này
      const groups = data.groups || [];
      const rowChars = extractRowChars(groups, rowKey);

      if (!rowChars.length) {
        if (typeof Toast !== "undefined")
          Toast.warning(`No data found for row "${rowKey}"`);
        return;
      }

      // 3. Xác định index ban đầu (Ký tự nào được click?)
      // Tìm thẻ <li> chứa <a> được click, xem nó là con thứ mấy trong <ul>
      let initialIndex = 0;
      const li = anchorElement.closest("li");
      if (li && li.parentElement) {
        const siblings = Array.from(li.parentElement.children).filter(
          (el) => el.tagName === "LI"
        );
        const idx = siblings.indexOf(li);
        if (idx >= 0 && idx < rowChars.length) {
          initialIndex = idx;
        }
      }

      // 4. Lưu trạng thái row hiện tại để hỗ trợ Tab switching
      modal
        .querySelector(".detail_inner")
        .setAttribute("data-current-row", rowKey);

      // 5. Render và Mở
      renderCharacter(
        modal.querySelector(".detail_inner"),
        rowChars,
        initialIndex
      );
      openModal();
    } catch (err) {
      console.error(err);
      if (typeof showApiError === "function") {
        showApiError(err.message);
      } else {
        alert("Error: " + err.message);
      }
    }
  }

  // Logic reload nội dung khi bấm Tab
  async function reloadModalContent(rowKey, activeIndex) {
    try {
      const data = await KanaService.getData(KANA_TYPE); // Lấy từ Cache
      const rowChars = extractRowChars(data.groups, rowKey);
      renderCharacter(
        modal.querySelector(".detail_inner"),
        rowChars,
        activeIndex
      );
    } catch (e) {
      console.error("Tab switch error", e);
    }
  }

  // Logic xử lý nút Audio
  function handleAudioClick(btn) {
    // Tìm thẻ audio nằm ngay cạnh nút bấm (trong cùng parent)
    const parent = btn.parentElement;
    const audio = parent.querySelector("audio");

    if (!audio) return;

    // Dừng các audio khác trong modal
    modal.querySelectorAll("audio").forEach((a) => {
      if (a !== audio) {
        a.pause();
        a.currentTime = 0;
      }
    });

    // Play/Replay
    audio.currentTime = 0;
    audio.play().catch((err) => console.warn("Audio playback failed:", err));
  }
})();
