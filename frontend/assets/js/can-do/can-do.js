function getCanDoIndex() {
  const urlParams = new URLSearchParams(window.location.search);
  const raw = urlParams.get("no") || urlParams.get("id") || "1";
  const idx = parseInt(raw, 10);
  return isNaN(idx) || idx < 1 ? 0 : idx - 1; // convert to 0-based
}

function mapAsset(url) {
  if (!url) return url;
  try {
    const file = url.split("/").pop();
    if (!file) return url;
    // images
    if (/\.(jpg|png|gif)$/i.test(file)) {
      // topic images used as title backgrounds
      if (/^(bg_page_title|topic_image)/i.test(file)) {
        return `assets/images/topic/bg/${file}`;
      }
      if (/question|_q\.|_a\./i.test(file)) {
        return `assets/images/topic/questions/${file}`;
      }
      if (/^cando_|^challenge/gi.test(file)) {
        return `assets/movies/thumbnail/topics/${file}`;
      }
      return `assets/images/topic/questions/${file}`;
    }

    // videos
    if (/\.(mp4)$/i.test(file)) {
      return `assets/movies/topics/mp4/${file}`;
    }
    if (/\.(webm)$/i.test(file)) {
      return `assets/movies/topics/webm/${file}`;
    }

    // xml
    if (/\.xml$/i.test(file)) {
      if (/^challenge/i.test(file)) {
        return `assets/data/topics/challenge/${file}`;
      }
      return `assets/data/topics/practice/${file}`;
    }

    // pdf
    if (/\.pdf$/i.test(file)) {
      return `assets/pdf/topics/${file}`;
    }
    return url;
  } catch (_) {
    return url;
  }
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPracticeMovies(movies) {
  if (!Array.isArray(movies) || movies.length === 0) return "";
  const thumbs = movies
    .map(
      (m, i) =>
        `<li class="${i === 0 ? "active" : ""}"><img src="${mapAsset(
          m.thumbnail
        )}" alt=""></li>`
    )
    .join("");
  const first = movies[0];
  const firstMp4 = mapAsset(first.src.mp4);
  const firstWebm = mapAsset(first.src.webm);
  return `
  <div id="step1_movie" class="cando_movie">
    <div class="cando_movie_navi">
      <div class="cando_movie_control">
        <dl>
          <dt>Hear the spoken lines</dt>
          <dd>
            <ul>
              <li><label>A<input type="checkbox" name="words" value="a" checked onclick="activator('voice_' , 'a' , this.checked);"><span class="mark"></span></label></li>
              <li><label>B<input type="checkbox" name="words" value="b" checked onclick="activator('voice_' , 'b' , this.checked);"><span class="mark"></span></label></li>
            </ul>
          </dd>
          <dt>See the script</dt>
          <dd>
            <ul>
              <li><label>A<input type="checkbox" name="subtitles" value="1" checked onclick="activator('captions_' , 'a' , this.checked);"><span class="mark"></span></label></li>
              <li><label>B<input type="checkbox" name="subtitles" value="2" checked onclick="activator('captions_' , 'b' , this.checked);"><span class="mark"></span></label></li>
            </ul>
          </dd>
        </dl>
        <ul class="language">
          <li><label>漢字・かな<input type="checkbox" name="language" value="1" checked onclick="activator('language_' , 'j' , this.checked);"><span class="mark"></span></label></li>
          <li><label>Roma-ji<input type="checkbox" name="language" value="2" checked onclick="activator('language_' , 'r' , this.checked);"><span class="mark"></span></label></li>
          <li><label>English<input type="checkbox" name="language" value="3" onclick="activator('language_' , 'e' , this.checked);"><span class="mark"></span></label></li>
        </ul>
      </div>
      <div class="cando_movie_changer"><ul>${thumbs}</ul></div>
    </div>
    <div class="cando_movie_player">
      <video id="video" playsinline controls controlslist="nodownload" poster="${mapAsset(
        first.thumbnail
      )}">
        <source src="${firstMp4}" class="mp4">
        <source src="${firstWebm}" class="webm">
        <p>To play the video, you need a browser that supports video tags.</p>
      </video>
      <div class="playbutton" style="display:block;"></div>
      <div class="control"></div>
    </div>
  </div>
  <div id="step1_captions" class="cando_movie_captions captions_a voice_a captions_b voice_b language_j language_r">
    <div class="speaker_wrap speaker_m">
      <p id="language_1" class="language_1"></p>
      <p id="language_2" class="language_2"></p>
      <p id="language_3" class="language_3"></p>
    </div>
  </div>`;
}

function buildPracticeQuestion(question) {
  if (!question) return "";
  const images = Array.isArray(question.images) ? question.images : [];
  if (!images.length) return "";

  // Work only with the filename (avoid matching directory names like '/questions/')
  const getBase = (u = "") => {
    try {
      return String(u).split("?")[0].split("#")[0].split("/").pop() || "";
    } catch (_) {
      return String(u || "");
    }
  };
  const isQ = (u) => /(_q\.|\bquestion\b)/i.test(getBase(u));
  const isA = (u) => /(_a\.|\banswer\b)/i.test(getBase(u));
  const firstQ = images.find(isQ);
  const firstA = images.find(isA);
  // Ensure question shows first when available
  const ordered = firstQ || firstA ? [firstQ, firstA].filter(Boolean) : images;

  const itemsHtml = ordered
    .map((rawUrl, idx) => {
      const url = mapAsset(rawUrl);
      const isQuestion = isQ(rawUrl);
      const isAnswer = isA(rawUrl);
      const typeClass = isAnswer ? "answer" : isQuestion ? "question" : "";
      // Mark the first slide as active for non-slick fallback
      const activeClass = idx === 0 ? " active" : "";
      return `<li class="${typeClass}${activeClass}" data-index="${idx}">
          <div class="contents">
            <span class="cando_questionimage_wrap" style="width:670px;background-image:url('${url}');display:inline-block;padding-bottom:66.4179%;">
              <img src="${url}" alt="${escapeHtml(
        question.alt || ""
      )}" class="cando_questionimage" style="display:none;" />
            </span>
          </div>
        </li>`;
    })
    .join("\n");

  const downloadHtml = question.downloadLink
    ? `<p class="download"><a href="${mapAsset(
        question.downloadLink
      )}" target="_blank" rel="noopener">Download</a></p>`
    : "";

  const carouselId = `cq_${Math.random().toString(36).slice(2)}`;
  const hasMultiple = (ordered || []).length > 1;
  const carouselItems = ordered
    .map((rawUrl, idx) => {
      const url = mapAsset(rawUrl);
      const isQuestion = isQ(rawUrl);
      const isAnswer = isA(rawUrl);
      // Give answer precedence if both patterns somehow match.
      const typeClass = isAnswer ? "answer" : isQuestion ? "question" : "";
      const activeClass = idx === 0 ? " active" : "";
      const badgeHtml = isAnswer
        ? '<div class="qa-badge qa-badge--answer" aria-label="Answer" title="Answer">Answer</div>'
        : isQuestion
        ? '<div class="qa-badge qa-badge--question" aria-label="Question" title="Question">Question</div>'
        : "";
      return `<div class="carousel-item${activeClass} ${typeClass}" data-index="${idx}">
          <div class="contents">
            ${badgeHtml}
            <span class="cando_questionimage_wrap" style="width:670px;background-image:url('${url}');display:inline-block;padding-bottom:66.4179%;">
              <img src="${url}" alt="${escapeHtml(
        question.alt || ""
      )}" class="cando_questionimage" style="display:none;" />
            </span>
          </div>
        </div>`;
    })
    .join("\n");

  const controlsHtml = hasMultiple
    ? `<button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
         <span class="carousel-control-prev-icon" aria-hidden="true"></span>
         <span class="visually-hidden">Previous</span>
       </button>
       <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
         <span class="carousel-control-next-icon" aria-hidden="true"></span>
         <span class="visually-hidden">Next</span>
       </button>`
    : "";

  return `<div class="cando_question">
    <div id="${carouselId}" class="carousel slide" data-bs-interval="false" data-bs-wrap="false" data-bs-touch="true">
      <div class="carousel-inner">
        ${carouselItems}
      </div>
      ${controlsHtml}
    </div>
    <div class="contents">${downloadHtml}</div>
  </div>`;
}

function buildChallenge(step) {
  if (!step) return "";
  const mp4 = mapAsset(step.video?.mp4);
  const webm = mapAsset(step.video?.webm);
  const thumb = mapAsset(step.thumbnail);
  return `
  <div id="step2_movie" class="cando_movie">
    <div class="cando_movie_navi callenge">
      <div class="cando_movie_control">
        <ul class="language">
          <li><label>漢字・かな<input type="checkbox" name="language" value="1" checked onclick="activator2('language_' , 'j' , this.checked);"><span class="mark"></span></label></li>
          <li><label>Roma-ji<input type="checkbox" name="language" value="2" checked onclick="activator2('language_' , 'r' , this.checked);"><span class="mark"></span></label></li>
          <li><label>English<input type="checkbox" name="language" value="3" onclick="activator2('language_' , 'e' , this.checked);"><span class="mark"></span></label></li>
        </ul>
      </div>
    </div>
    <div class="cando_movie_player challenge">
      <video id="video2" playsinline controls controlslist="nodownload" poster="${thumb}">
        <source src="${mp4}" class="mp4">
        <source src="${webm}" class="webm">
        <p>To play the video, you need a browser that supports video tags.</p>
      </video>
      <div class="playbutton" style="display:block;"></div>
      <div class="control"></div>
    </div>
  </div>
  <div id="step2_captions" class="cando_movie_captions captions_a voice_a captions_b voice_b language_j language_r">
    <div class="speaker_wrap speaker_m">
      <p id="language_c1" class="language_1"></p>
      <p id="language_c2" class="language_2"></p>
      <p id="language_c3" class="language_3"></p>
    </div>
  </div>`;
}

async function loadCanDoContent() {
  const idx = getCanDoIndex();
  const container = document.getElementById("can-do");
  if (!container) return;

  try {
    // Fetch candos and topics data
    const [candosRes, topicsRes] = await Promise.all([
      fetch("data/en/candos.json"),
      fetch("data/en/topics.json"),
    ]);
    if (!candosRes.ok) throw new Error("Failed to fetch candos.json");
    if (!topicsRes.ok) throw new Error("Failed to fetch topics.json");
    const data = await candosRes.json();
    const topicsData = await topicsRes.json();
    const entry = data[idx];
    if (!entry) {
      container.innerHTML = `<p>Can-do content not found.</p>`;
      return;
    }

    const h = entry.heading || {};
    const topicNo = parseInt(h.topicNo || "1", 10) || 1;
    // Get current topic info from topics.json
    const currentTopic = (topicsData.topics || []).find(
      (t) => parseInt(t.heading?.no, 10) === parseInt(topicNo, 10)
    );
    const accent = currentTopic?.color || "#b41e22";
    // Use local topic background image (e.g., assets/images/topic/bg/bg_page_title2.jpg)
    const topicBgImg = mapAsset(`bg_page_title${topicNo}.jpg`);
    const candoNum = h.candoTitle?.replace(/[^0-9]/g, "") || String(idx + 1);
    const candoSubtitle = (h.candoSubtitle || "").replace(/\n/g, "<br>");

    // Steps: expecting step1 (practice) and step2 (challenge)
    const step1 = (entry.steps || []).find((s) => s.id === "step1");
    const step2 = (entry.steps || []).find((s) => s.id === "step2");

    const practiceBlock = step1
      ? `<div id="step1">
          <h4 class="step_heading"><strong>${escapeHtml(
            step1.title
          )}</strong><span>${escapeHtml(step1.subtitle)}</span></h4>
          ${
            step1.movies
              ? buildPracticeMovies(step1.movies)
              : buildPracticeQuestion(step1.question)
          }
        </div>
        <button href="#step2" class="cando_navi_btn btn btn-primary w-100"><span>Next step</span></button>`
      : "";

    const challengeBlock = step2
      ? `<div id="step2">
          <h4 class="step_heading"><strong>${escapeHtml(
            step2.title
          )}</strong><span>${escapeHtml(step2.subtitle)}</span></h4>
          ${buildChallenge(step2)}
        </div>`
      : "";

    function buildCandoNavigator(topicNo, currentNo) {
      try {
        const topic = (topicsData.topics || []).find(
          (t) => parseInt(t.heading?.no, 10) === parseInt(topicNo, 10)
        );

        if (!topic) return "";
        const items = [];
        (topic.lessons || []).forEach((lesson) => {
          const lessonLabel = `Lesson${lesson.heading?.no}\u2003${
            lesson.heading?.title || ""
          }`;
          (lesson.candos || []).forEach((c) => {
            const no = c.no;
            const active = String(no) === String(currentNo) ? " current" : "";
            items.push(`
              <li class="${active.trim()}"><a href="can-do.html?no=${no}">
                <div class="number"><span>${escapeHtml(
                  lessonLabel
                )}</span><strong>Can-do <span class="cando_no" aria-hidden="true">${escapeHtml(
              String(no)
            )}</span></strong></div>
                <div class="title">${escapeHtml(c.title || "")}</div>
              </a></li>`);
          });
        });

        if (!items.length) return "";
        return `
          <button class="cando_navi_btn btn btn-primary">
            <span class="open">Select Can-do</span>
            <span class="close">Close</span>
          </button>
          <ul class="cando_navi">${items.join("\n")}</ul>`;
      } catch (e) {
        console.warn("[can-do] buildCandoNavigator error", e);
        return "";
      }
    }

    const candoNavigator = buildCandoNavigator(topicNo, parseInt(candoNum, 10));

    function buildTopicsList(topics) {
      try {
        if (!Array.isArray(topics)) return "";
        const items = topics.map((t, i) => {
          const tNo = t.heading?.no;
          const tTitle = t.heading?.title || "";
          const tRomaji = t.heading?.romaji || "";
          const tMeaning = t.heading?.meaning || "";
          const tColor = t.color || "#b41e22";
          // Find the first available can-do number within this topic
          let firstCanDoNo = "1";
          const lessons = Array.isArray(t.lessons) ? t.lessons : [];
          for (const lesson of lessons) {
            const candos = Array.isArray(lesson.candos) ? lesson.candos : [];
            if (candos.length) {
              firstCanDoNo = candos[0]?.no ?? firstCanDoNo;
              break;
            }
          }
          return `
            <li style="--accent-color:${escapeHtml(tColor)};">
              <a href="can-do.html?no=${escapeHtml(String(firstCanDoNo))}">
                <h4>TOPIC<br><span>${escapeHtml(String(tNo))}</span></h4>
                <span>
                  <strong>${escapeHtml(tTitle)}</strong><br><i>${escapeHtml(
            tRomaji
          )}</i> / ${escapeHtml(tMeaning)}
                </span>
              </a>
            </li>`;
        });
        return items.join("\n");
      } catch (e) {
        console.warn("[can-do] buildTopicsList error", e);
        return "";
      }
    }
    const topicsListHtml = buildTopicsList(topicsData.topics || []);

    // Build breadcrumb + title container
    const html = `
    <div class="nav_container py-3">
      <div class="container">
        <div class="row">
          <div class="col-6">
            <nav style="--bs-breadcrumb-divider: ''" aria-label="breadcrumb">
              <ol class="breadcrumb custom-breadcrumb">
                <li class="breadcrumb-item home"><a href="index.html" aria-label="Home">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="#fff"/></svg>
                  <span class="label">HOME</span></a></li>
                <li class="breadcrumb-item active" aria-current="page">Can-do ${escapeHtml(
                  candoNum
                )}</li>
              </ol>
            </nav>
          </div>
          <div class="topics_navi col-6 d-flex justify-content-end">
            <button class="topics_navi_btn btn btn-primary" type="button" aria-haspopup="true" aria-expanded="false">
                Select Topics
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 11.5L3 5.5h10L8 11.5z" />
                </svg>
            </button>
            
            <div class="topics_navi_list">
                <div class="row px-3 py-2">
                    <div class="col-12 d-flex align-items-center justify-content-center position-relative">
                        <h3 class="m-0">Select Topics</h3>
                        <button type="button" class="topics_navi_close position-absolute end-0 me-3 p-4" aria-label="Close"></button>
                    </div>
                </div>
        <ul>
          ${topicsListHtml}
        </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  <div class="title_container" style="--accent-color:${accent};${
      topicBgImg ? ` background-image:url('${topicBgImg}');` : ""
    }">
      <div class="container">
        <div class="row align-items-center">
          <div class="page_title col-6">
            <h4>TOPIC<br><span>${escapeHtml(h.topicNo)}</span></h4>
            <span><strong>${escapeHtml(
              h.topicTitle
            )}</strong><br><i>${escapeHtml(h.topicRomaji)}</i> / ${escapeHtml(
      h.topicMeaning
    )}</span>
          </div>
          <div class="page_subtitle col-6">
            <span>Can-do ${escapeHtml(candoNum)}</span>
            <strong>${candoSubtitle}</strong>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-4">
      ${candoNavigator}
    </div>
    <section>
      <div class="container">${practiceBlock}${challengeBlock}</div>
    </section>`;

    container.style.setProperty("--accent-color", accent);
    container.innerHTML = html;

    try {
      const qBlocks = container.querySelectorAll(".cando_question");
      qBlocks.forEach((q) => {
        if (q.dataset.controlsWired === "true") return;
        const ul = q.querySelector("ul");
        const prevBtn = q.querySelector(".cq_prev");
        const nextBtn = q.querySelector(".cq_next");
        if (!ul || !prevBtn || !nextBtn) return;

        // Initial visibility defaults
        prevBtn.classList.add("is-hidden");
        nextBtn.classList.remove("is-hidden");

        const hasSlick =
          window.jQuery && window.jQuery.fn && window.jQuery.fn.slick;

        if (hasSlick) {
          const $ul = window.jQuery(ul);
          // Determine initial slide: prefer the question if present
          let initialSlide = 0;
          try {
            const lis = ul.querySelectorAll("li");
            for (let i = 0; i < lis.length; i++) {
              if (lis[i].classList.contains("question")) {
                initialSlide = i;
                break;
              }
            }
          } catch (_) {}

          $ul.slick({
            infinite: false,
            arrows: false,
            dots: false,
            adaptiveHeight: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            initialSlide,
          });

          $ul.on("afterChange", function (e, slick, currentSlide) {
            try {
              const i =
                typeof currentSlide === "number"
                  ? currentSlide
                  : slick.currentSlide || 0;
              const last = (slick.slideCount || 1) - 1;
              prevBtn.classList.toggle("is-hidden", i === 0);
              nextBtn.classList.toggle("is-hidden", i === last);
            } catch (_) {}
          });
          // Sync initial state
          try {
            const slickObj = $ul.slick("getSlick");
            const i = slickObj ? slickObj.currentSlide || 0 : 0;
            const last = slickObj ? (slickObj.slideCount || 1) - 1 : 0;
            prevBtn.classList.toggle("is-hidden", i === 0);
            nextBtn.classList.toggle("is-hidden", i === last);
          } catch (_) {}

          prevBtn.addEventListener("click", () => {
            try {
              window.jQuery(ul).slick("slickPrev");
            } catch (_) {}
          });
          nextBtn.addEventListener("click", () => {
            try {
              window.jQuery(ul).slick("slickNext");
            } catch (_) {}
          });
        } else {
          // Simple JS slider fallback
          const items = Array.from(ul.querySelectorAll("li"));
          if (!items.length) return;
          let current = items.findIndex((li) =>
            li.classList.contains("question")
          );
          if (current < 0) current = 0;

          const render = () => {
            items.forEach((li, idx) => {
              const active = idx === current;
              li.style.display = active ? "" : "none";
              li.classList.toggle("active", active);
            });
            prevBtn.classList.toggle("is-hidden", current === 0);
            nextBtn.classList.toggle("is-hidden", current === items.length - 1);
          };

          render();

          prevBtn.addEventListener("click", () => {
            if (current > 0) {
              current -= 1;
              render();
            }
          });
          nextBtn.addEventListener("click", () => {
            if (current < items.length - 1) {
              current += 1;
              render();
            }
          });
        }

        q.dataset.controlsWired = "true";
      });
    } catch (e) {
      console.warn("[can-do] question controls wiring failed", e);
    }

    try {
      const carousels = container.querySelectorAll(".cando_question .carousel");
      carousels.forEach((car) => {
        const prev = car.querySelector(".carousel-control-prev");
        const next = car.querySelector(".carousel-control-next");
        const items = Array.from(car.querySelectorAll(".carousel-item"));
        const total = items.length;
        if (!prev && !next) return;
        const getActiveIndex = () =>
          items.findIndex((el) => el.classList.contains("active"));
        const update = () => {
          const i = getActiveIndex();
          if (prev) {
            const disabled = i <= 0;
            prev.classList.toggle("disabled", disabled);
            prev.setAttribute("aria-disabled", disabled ? "true" : "false");
            prev.tabIndex = disabled ? -1 : 0;
          }
          if (next) {
            const disabled = i >= total - 1;
            next.classList.toggle("disabled", disabled);
            next.setAttribute("aria-disabled", disabled ? "true" : "false");
            next.tabIndex = disabled ? -1 : 0;
          }
        };
        update();
        car.addEventListener("slid.bs.carousel", update);
      });
    } catch (e) {
      console.warn("[can-do] carousel control state wiring failed", e);
    }

    document.dispatchEvent(
      new CustomEvent("canDo:rendered", { detail: { index: idx } })
    );
  } catch (err) {
    console.error("[can-do] Error loading content", err);
    container.innerHTML = `<p>Error loading data.</p>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCanDoContent);
} else {
  loadCanDoContent();
}
