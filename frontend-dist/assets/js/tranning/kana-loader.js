(function () {
  "use strict";

  const hiraganaContainer = document.getElementById("hiragana");
  const katakanaContainer = document.getElementById("katakana");

  if (!hiraganaContainer && !katakanaContainer) return;

  const KANA_TYPE = hiraganaContainer ? "hiragana" : "katakana";

  const SEIDAKUON_ORDER = [
    { key: "a", cls: "alone" },
    { key: "ka", cls: "double" },
    { key: "ga", cls: "" },
    { key: "sa", cls: "double" },
    { key: "za", cls: "" },
    { key: "ta", cls: "double" },
    { key: "da", cls: "" },
    { key: "na", cls: "alone" },
    { key: "ha", cls: "double" },
    { key: "ba", cls: "" },
    { key: "pa", cls: "alone_psound" },
    { key: "ma", cls: "alone" },
    { key: "ya", cls: "alone" },
    { key: "ra", cls: "alone" },
    { key: "wa", cls: "alone" },
    { key: "n", cls: "alone" },
  ];

  const YOUON_ORDER = [
    { key: "kya", cls: "double" },
    { key: "gya", cls: "" },
    { key: "sha", cls: "double" },
    { key: "ja", cls: "" },
    { key: "cha", cls: "alone" },
    { key: "nya", cls: "alone" },
    { key: "hya", cls: "double" },
    { key: "bya", cls: "" },
    { key: "pya", cls: "alone_psound" },
    { key: "mya", cls: "alone" },
    { key: "rya", cls: "alone" },
  ];

  function detectRowKey(char) {
    if (char.rowName && char.rowName.trim() !== "") {
      return char.rowName.split(" ")[0];
    }

    const r = (char.romaji || "").toLowerCase();
    if (!r) return "misc";

    // --- Youon Patterns ---
    if (r.startsWith("ky")) return "kya";
    if (r.startsWith("gy")) return "gya";
    if (r.startsWith("sh") && r !== "shi") return "sha"; // sha, shu, sho
    if (r.startsWith("j") && r !== "ji") return "ja"; // ja, ju, jo
    if (r.startsWith("ch") && r !== "chi") return "cha"; // cha, chu, cho
    if (r.startsWith("ny")) return "nya";
    if (r.startsWith("hy")) return "hya";
    if (r.startsWith("by")) return "bya";
    if (r.startsWith("py")) return "pya";
    if (r.startsWith("my")) return "mya";
    if (r.startsWith("ry")) return "rya";

    // --- Seidakuon Patterns ---
    if (r === "n") return "n";
    if (r.startsWith("w")) return "wa";
    if (r.startsWith("r")) return "ra";
    if (r.startsWith("y")) return "ya";
    if (r.startsWith("m")) return "ma";
    if (r.startsWith("p")) return "pa";
    if (r.startsWith("b")) return "ba";

    // Ha row: ha, hi, fu, he, ho
    if (r.startsWith("h") || r === "fu") return "ha";

    if (r.startsWith("n")) return "na";

    // Da row: da, ji(di), zu(du), de, do
    // Lưu ý: 'ji' và 'zu' thường thuộc Za row, nhưng ở đây ta check Da trước hoặc dựa vào context.
    // Tuy nhiên, API thường trả về 'ji'/'zu' cho Da row dưới dạng 'ji'/'zu' hoặc 'di'/'du'.
    if (r.startsWith("d")) return "da";

    // Ta row: ta, chi, tsu, te, to
    if (r.startsWith("t") || r === "chi" || r === "tsu") return "ta";

    // Za row: za, ji, zu, ze, zo
    if (r.startsWith("z") || r === "ji") return "za";

    // Sa row: sa, shi, su, se, so
    if (r.startsWith("s") || r === "shi") return "sa";

    if (r.startsWith("g")) return "ga";
    if (r.startsWith("k")) return "ka";

    // Vowels
    if (["a", "i", "u", "e", "o"].includes(r)) return "a";

    return "misc";
  }

  // Hàm tính điểm để sắp xếp thứ tự (a -> i -> u -> e -> o)
  function getVowelScore(romaji) {
    if (!romaji) return 99;
    const r = romaji.toLowerCase();
    if (r === "n") return 6;

    const lastChar = r.slice(-1);
    switch (lastChar) {
      case "a":
        return 1;
      case "i":
        return 2;
      case "u":
        return 3;
      case "e":
        return 4;
      case "o":
        return 5;
      default:
        return 99;
    }
  }

  function groupCharactersByRow(characters) {
    const groups = {};
    characters.forEach((char) => {
      const rowKey = detectRowKey(char);
      if (!groups[rowKey]) {
        groups[rowKey] = [];
      }
      groups[rowKey].push(char);
    });
    return groups;
  }

  // ==========================================
  // 3. RENDER UI
  // ==========================================

  function createCharItemHTML(char) {
    const romaji = char.romaji || "";
    const charName = char.characterName || "";
    const audioUrl = char.audio || "";
    const formImgUrl = `assets/images/${KANA_TYPE}/form/${romaji}.png`;
    const rowKey = detectRowKey(char);

    return `
      <li>
          <a href="#detail_column_${rowKey}" class="inline_modal cboxElement">
              <img src="${formImgUrl}" alt="${charName}" onerror="this.src='assets/images/common/no-image.png'; this.onerror=null;">
          </a>
          <button type="button" class="js-audio-btn">
              <img src="assets/images/common/icon_sounds.png" alt="Play">
              ${romaji}
          </button>
          <audio preload="auto">
              ${audioUrl ? `<source src="${audioUrl}" type="audio/mp3">` : ""}
          </audio>
      </li>
    `;
  }

  function renderGroup(groupData, orderConfig, containerEl) {
    const groupClass = groupData.groupName || "seidakuon";
    const groupDiv = document.createElement("div");
    groupDiv.className = groupClass;

    const mainUl = document.createElement("ul");
    const characters = groupData.characters || [];
    const groupedChars = groupCharactersByRow(characters);

    // Duyệt theo thứ tự cấu hình (ORDER) để đảm bảo vị trí không bị đảo lộn
    orderConfig.forEach((config) => {
      const rowKey = config.key;
      let charsInRow = groupedChars[rowKey];

      // Nếu hàng này không có dữ liệu, bỏ qua
      if (!charsInRow || charsInRow.length === 0) return;

      // Sắp xếp nội bộ hàng: a, i, u, e, o
      charsInRow.sort(
        (a, b) => getVowelScore(a.romaji) - getVowelScore(b.romaji)
      );

      const colLi = document.createElement("li");
      const extraClass = config.cls ? ` ${config.cls}` : "";
      colLi.className = `column_${rowKey}${extraClass}`;

      const innerUl = document.createElement("ul");
      charsInRow.forEach((char) => {
        innerUl.insertAdjacentHTML("beforeend", createCharItemHTML(char));
      });

      colLi.appendChild(innerUl);
      mainUl.appendChild(colLi);
    });

    groupDiv.appendChild(mainUl);
    containerEl.appendChild(groupDiv);
  }

  function renderKanaSection(data) {
    const container = hiraganaContainer || katakanaContainer;
    const charListDiv = container.querySelector(".char_list");

    if (!charListDiv) return;
    charListDiv.innerHTML = "";

    if (!Array.isArray(data.groups)) return;

    // Tìm nhóm Seidakuon (hoặc fallback nếu tên không khớp)
    const seidakuonGroup = data.groups.find(
      (g) =>
        g.groupName === "seidakuon" ||
        g.groupName === "hiragana" ||
        g.groupName === "katakana"
    );

    // Tìm nhóm Youon
    const youonGroup = data.groups.find((g) => g.groupName === "youon");

    if (seidakuonGroup) {
      // Gán cứng class để CSS nhận diện đúng
      seidakuonGroup.groupName = "seidakuon";
      renderGroup(seidakuonGroup, SEIDAKUON_ORDER, charListDiv);
    }

    if (youonGroup) {
      renderGroup(youonGroup, YOUON_ORDER, charListDiv);
    }
  }

  // ==========================================
  // 4. KHỞI CHẠY
  // ==========================================
  async function init() {
    try {
      if (typeof KanaService === "undefined") {
        throw new Error("KanaService missing");
      }
      const response = await KanaService.getData(KANA_TYPE);
      renderKanaSection(response);
    } catch (error) {
      console.error("Kana Loader Error:", error);
      const container = hiraganaContainer || katakanaContainer;
      const list = container.querySelector(".char_list");
      if (list)
        list.innerHTML = `<div class="alert alert-danger text-center m-5">Failed to load data.</div>`;
    }
  }

  // Event delegation cho nút Audio
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".char_list .js-audio-btn");
    if (!btn) return;
    e.preventDefault();

    const audio = btn.nextElementSibling;
    if (audio && audio.tagName === "AUDIO") {
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn("Audio play warning:", err));
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
