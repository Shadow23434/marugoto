(function () {
  "use strict";

  function getCanDoNo() {
    const urlParams = new URLSearchParams(window.location.search);
    const raw = urlParams.get("no") || urlParams.get("id") || "1";
    const val = parseInt(raw, 10);
    return isNaN(val) || val < 1 ? 1 : val;
  }

  function mapAsset(url) {
    if (!url) return "";
    try {
      if (url.startsWith("http")) return url;
      const file = url.split("/").pop();
      if (!file) return url;

      if (/\.(jpg|png|gif)$/i.test(file)) {
        if (/^(bg_page_title|topic_image)/i.test(file))
          return `assets/images/topic/bg/${file}`;
        if (/question|_q\.|_a\./i.test(file))
          return `assets/images/topic/questions/${file}`;
        return `assets/movies/thumbnail/topics/${file}`;
      }
      if (/\.(mp4)$/i.test(file)) return `assets/movies/topics/mp4/${file}`;
      if (/\.(webm)$/i.test(file)) return `assets/movies/topics/webm/${file}`;
      if (/\.xml$/i.test(file)) {
        return /^challenge/i.test(file)
          ? `assets/data/topics/challenge/${file}`
          : `assets/data/topics/practice/${file}`;
      }
      if (/\.pdf$/i.test(file)) return `assets/pdf/topics/${file}`;
      return url;
    } catch (_) {
      return url;
    }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  async function fetchJson(url) {
    const fullUrl = typeof getApiUrl === "function" ? getApiUrl(url) : url;
    const res = await fetch(fullUrl);
    if (!res.ok)
      throw new Error(`Failed to fetch ${url} (Status: ${res.status})`);
    return await res.json();
  }

  // =========================================================
  // 2. HTML BUILDERS
  // =========================================================

  function buildPracticeMovies(movies) {
    if (!Array.isArray(movies) || !movies.length) return "";

    const thumbs = movies
      .map(
        (m, i) =>
          `<li class="${i === 0 ? "active" : ""}"><img src="${mapAsset(
            m.thumbnail
          )}" alt=""></li>`
      )
      .join("");

    const first = movies[0];
    const mp4 = mapAsset(first.src?.mp4 || first.mp4);
    const webm = mapAsset(first.src?.webm || first.webm);

    return `
    <div id="step1_movie" class="cando_movie">
      <div class="cando_movie_navi">
        <div class="cando_movie_control">
          <dl>
            <dt>Hear the spoken lines</dt>
            <dd><ul>
              <li><label>A<input type="checkbox" name="words" value="a" checked onclick="activator('voice_','a',this.checked);"><span class="mark"></span></label></li>
              <li><label>B<input type="checkbox" name="words" value="b" checked onclick="activator('voice_','b',this.checked);"><span class="mark"></span></label></li>
            </ul></dd>
            <dt>See the script</dt>
            <dd><ul>
              <li><label>A<input type="checkbox" name="subtitles" value="1" checked onclick="activator('captions_','a',this.checked);"><span class="mark"></span></label></li>
              <li><label>B<input type="checkbox" name="subtitles" value="2" checked onclick="activator('captions_','b',this.checked);"><span class="mark"></span></label></li>
            </ul></dd>
          </dl>
          <ul class="language">
            <li><label>漢字・かな<input type="checkbox" name="language" value="1" checked onclick="activator('language_','j',this.checked);"><span class="mark"></span></label></li>
            <li><label>Roma-ji<input type="checkbox" name="language" value="2" checked onclick="activator('language_','r',this.checked);"><span class="mark"></span></label></li>
            <li><label>English<input type="checkbox" name="language" value="3" onclick="activator('language_','e',this.checked);"><span class="mark"></span></label></li>
          </ul>
        </div>
        <div class="cando_movie_changer"><ul>${thumbs}</ul></div>
      </div>
      <div class="cando_movie_player">
        <video id="video" playsinline controls controlslist="nodownload" poster="${mapAsset(
          first.thumbnail
        )}">
          <source src="${mp4}" class="mp4"><source src="${webm}" class="webm">
          <p>To play the video, you need a browser that supports video tags.</p>
        </video>
        <div class="playbutton" style="display:block;"></div>
        <div class="control"></div>
      </div>
    </div>
    <div id="step1_captions" class="cando_movie_captions captions_a voice_a captions_b voice_b language_j language_r">
      <div class="speaker_wrap speaker_m">
        <p id="language_1" class="language_1"></p><p id="language_2" class="language_2"></p><p id="language_3" class="language_3"></p>
      </div>
    </div>`;
  }

  function buildPracticeQuestion(question) {
    if (!question || !Array.isArray(question.images) || !question.images.length)
      return "";

    const images = question.images;
    const isQ = (u) => /(_q\.|\bquestion\b)/i.test(String(u));
    const isA = (u) => /(_a\.|\banswer\b)/i.test(String(u));

    const ordered = [...images].sort((a, b) => (isQ(a) ? -1 : 1));
    const carouselId = `cq_${Math.random().toString(36).slice(2)}`;

    const items = ordered
      .map((raw, idx) => {
        const url = mapAsset(raw);
        const active = idx === 0 ? " active" : "";
        let badge = "";
        if (isA(raw))
          badge = '<div class="qa-badge qa-badge--answer">Answer</div>';
        else if (isQ(raw))
          badge = '<div class="qa-badge qa-badge--question">Question</div>';

        return `
        <div class="carousel-item${active}">
            <div class="contents">
                ${badge}
                <span class="cando_questionimage_wrap" style="width:100%;"><img src="${url}" class="d-block w-100" alt="Question Image"></span>
            </div>
        </div>`;
      })
      .join("");

    const controls =
      ordered.length > 1
        ? `
      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    `
        : "";

    const dlLink = question.downloadLink
      ? `<p class="download"><a href="${mapAsset(
          question.downloadLink
        )}" target="_blank" rel="noopener">Download PDF</a></p>`
      : "";

    return `
    <div class="cando_question">
      <div id="${carouselId}" class="carousel slide" data-bs-interval="false" data-bs-wrap="false">
        ${controls}
        <div class="carousel-inner">${items}</div>
      </div>
      <div class="contents">${dlLink}</div>
    </div>`;
  }

  function buildChallenge(step) {
    if (!step) return "";
    const vid = step.video || {};
    const mp4 = mapAsset(vid.mp4);
    const webm = mapAsset(vid.webm);
    const thumb = mapAsset(step.thumbnail);

    return `
    <div id="step2_movie" class="cando_movie">
      <div class="cando_movie_navi callenge">
         <div class="cando_movie_control"><ul class="language">
            <li><label>漢字・かな<input type="checkbox" name="language" value="1" checked onclick="activator2('language_','j',this.checked);"><span class="mark"></span></label></li>
            <li><label>Roma-ji<input type="checkbox" name="language" value="2" checked onclick="activator2('language_','r',this.checked);"><span class="mark"></span></label></li>
            <li><label>English<input type="checkbox" name="language" value="3" onclick="activator2('language_','e',this.checked);"><span class="mark"></span></label></li>
         </ul></div>
      </div>
      <div class="cando_movie_player challenge">
        <video id="video2" playsinline controls controlslist="nodownload" poster="${thumb}">
          <source src="${mp4}" class="mp4"><source src="${webm}" class="webm">
          <p>To play the video, you need a browser that supports video tags.</p>
        </video>
        <div class="playbutton" style="display:block;"></div>
        <div class="control"></div>
      </div>
    </div>
    <div id="step2_captions" class="cando_movie_captions captions_a voice_a captions_b voice_b language_j language_r">
        <div class="speaker_wrap speaker_m"><p id="language_c1"></p><p id="language_c2"></p><p id="language_c3"></p></div>
    </div>`;
  }

  // =========================================================
  // 3. DATA FETCHING (Client-side Hydration)
  // =========================================================

  async function fetchFullTreeData() {
    console.log("[CanDo] Starting Data Hydration...");
    const topicsPage = await fetchJson("/topics?size=100&sort=orderIndex,asc");
    const topics = topicsPage.content || [];

    const topicsWithLessons = await Promise.all(
      topics.map(async (topic) => {
        const lessons = await fetchJson(`/lessons/by-topic/${topic.id}`);
        const lessonsWithCanDos = await Promise.all(
          lessons.map(async (lesson) => {
            const candos = await fetchJson(`/can-do/by-lesson/${lesson.id}`);
            return { ...lesson, candos: candos };
          })
        );
        return { ...topic, lessons: lessonsWithCanDos };
      })
    );

    return topicsWithLessons;
  }

  // =========================================================
  // 4. MAIN EXECUTION
  // =========================================================

  async function loadCanDoContent() {
    const targetNo = getCanDoNo();
    const container = document.getElementById("can-do");
    if (!container) return;

    try {
      const allTopics = await fetchFullTreeData();
      console.log("[CanDo] Full Data Tree:", allTopics);

      let realId = null;
      let currentTopic = null;
      let apiCanDo = null;

      outerLoop: for (const topic of allTopics) {
        const lessons = topic.lessons || [];
        for (const lesson of lessons) {
          const candos = lesson.candos || [];
          const found = candos.find((c) => c.orderGlobal === targetNo);
          if (found) {
            realId = found.id;
            currentTopic = topic;
            apiCanDo = found;
            break outerLoop;
          }
        }
      }

      if (!apiCanDo) {
        container.innerHTML = `<div class="container mt-5 alert alert-warning">Can-do content #${targetNo} not found.</div>`;
        return;
      }

      // --- ADAPTER ---
      const topicsData = {
        topics: allTopics.map((t) => ({
          heading: {
            no: t.orderIndex,
            title: t.title,
            romaji: t.titleRomaji,
            meaning: t.titleEn,
          },
          color: t.hexColor,
          topicImageUrl: t.thumbnail,
          lessons: (t.lessons || []).map((l) => ({
            heading: { no: l.lessonNumber, title: l.title },
            candos: (l.candos || []).map((c) => ({
              no: c.orderGlobal,
              title: c.content,
            })),
          })),
        })),
      };

      const entry = {
        heading: {
          topicNo: currentTopic?.orderIndex,
          topicTitle: currentTopic?.title,
          topicRomaji: currentTopic?.titleRomaji,
          topicMeaning: currentTopic?.titleEn,
          candoTitle: apiCanDo.content,
          candoSubtitle: apiCanDo.subtitle,
        },
        steps: apiCanDo.steps || [],
      };

      // --- RENDER ---
      const h = entry.heading;
      const accent = currentTopic?.hexColor || "#b41e22";
      const topicBgImg = mapAsset(`bg_page_title${h.topicNo}.jpg`);
      const subtitleHtml = (h.candoSubtitle || "").replace(/\n/g, "<br>");
      const candoNum = String(targetNo);

      const step1 = entry.steps.find((s) => s.id === "step1");
      const step2 = entry.steps.find((s) => s.id === "step2");

      const practiceHtml = step1
        ? `
        <div id="step1">
          <h4 class="step_heading"><strong>${escapeHtml(
            step1.title
          )}</strong><span>${escapeHtml(step1.subtitle)}</span></h4>
          ${
            step1.movies
              ? buildPracticeMovies(step1.movies)
              : buildPracticeQuestion(step1.question)
          }
        </div>
        <button href="#step2" class="cando_navi_btn btn btn-primary w-100" data-scroll-offset="100"><span>Next step</span></button>
      `
        : "";

      const challengeHtml = step2
        ? `
        <div id="step2">
           <h4 class="step_heading"><strong>${escapeHtml(
             step2.title
           )}</strong><span>${escapeHtml(step2.subtitle)}</span></h4>
           ${buildChallenge(step2)}
        </div>
      `
        : "";

      // --- NAVIGATORS ---
      const buildTopicsNav = () =>
        topicsData.topics
          .map((t) => {
            const firstNo = t.lessons?.[0]?.candos?.[0]?.no || 1;
            return `<li style="--accent-color:${
              t.color
            }"><a href="can-do.html?no=${firstNo}">
           <h4>TOPIC<br><span>${t.heading.no}</span></h4>
           <span><strong>${escapeHtml(t.heading.title)}</strong><br><i>${
              t.heading.romaji
            }</i> / ${t.heading.meaning}</span>
         </a></li>`;
          })
          .join("");

      const buildLessonNav = () => {
        const activeTopic = topicsData.topics.find(
          (t) => t.heading.no === h.topicNo
        );
        if (!activeTopic) return "";
        const list = [];
        activeTopic.lessons.forEach((l) => {
          l.candos.forEach((c) => {
            const active = c.no === targetNo ? " current" : "";
            list.push(`<li class="${active.trim()}"><a href="can-do.html?no=${
              c.no
            }">
               <div class="number"><span>Lesson${l.heading.no} ${escapeHtml(
              l.heading.title
            )}</span><strong>Can-do <span class="cando_no">${
              c.no
            }</span></strong></div>
               <div class="title">${escapeHtml(c.title)}</div>
             </a></li>`);
          });
        });
        return `<button class="cando_navi_btn btn btn-primary"><span class="open">Select Can-do</span><span class="close">Close</span></button><ul class="cando_navi">${list.join(
          ""
        )}</ul>`;
      };

      // --- INJECT HTML VỚI BREADCRUMB ĐÃ SỬA ---
      container.style.setProperty("--accent-color", accent);
      container.innerHTML = `
        <div class="nav_container py-3">
          <div class="container">
            <div class="row">
              <div class="col-6">
                <nav style="--bs-breadcrumb-divider: ''" aria-label="breadcrumb">
                  <ol class="breadcrumb custom-breadcrumb">
                    <li class="breadcrumb-item home">
                      <a href="index.html" aria-label="Home">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="#fff"/>
                        </svg>
                        <span class="label">HOME</span>
                      </a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">Can-do ${escapeHtml(
                      candoNum
                    )}</li>
                  </ol>
                </nav>
              </div>
              <div class="topics_navi col-6 d-flex justify-content-end">
                <button class="topics_navi_btn btn btn-primary">Select Topics</button>
                <div class="topics_navi_list">
                   <div class="row px-3 py-2"><div class="col-12 text-center position-relative"><h3 class="m-0">Select Topics</h3><button class="topics_navi_close position-absolute end-0 me-3 p-4">&times;</button></div></div>
                   <ul>${buildTopicsNav()}</ul>
                </div>
             </div>
          </div></div>
        </div>
        <div class="title_container" style="--accent-color:${accent}; background-image:url('${topicBgImg}')">
           <div class="container"><div class="row align-items-center">
              <div class="page_title col-6"><h4>TOPIC<br><span>${
                h.topicNo
              }</span></h4><span><strong>${escapeHtml(
        h.topicTitle
      )}</strong><br><i>${h.topicRomaji}</i> / ${h.topicMeaning}</span></div>
              <div class="page_subtitle col-6"><span>Can-do ${escapeHtml(
                candoNum
              )}</span><strong>${subtitleHtml}</strong></div>
           </div></div>
        </div>
        <div class="container mt-4">${buildLessonNav()}</div>
        <section><div class="container">${practiceHtml}${challengeHtml}</div></section>
      `;

      // Dispatch event render done
      document.dispatchEvent(
        new CustomEvent("canDo:rendered", { detail: { index: targetNo } })
      );
    } catch (e) {
      console.error("[CanDo] Error:", e);
      if (typeof showApiError === "function") showApiError(e.message);
      container.innerHTML = `<div class="container mt-5 alert alert-danger">Error: ${e.message}</div>`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadCanDoContent);
  } else {
    loadCanDoContent();
  }
})();
