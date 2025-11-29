(function () {
  "use strict";

  const API_BASE_URL = getApiUrl("");
  console.log("API Base URL:", API_BASE_URL);

  function renderActivities(activities, initialActiveIndex = 0) {
    const indicators = document.getElementById("activities_indicators");
    const inner = document.getElementById("activities_inner");

    if (!indicators || !inner) {
      console.error("Carousel elements not found");
      return;
    }

    indicators.innerHTML = "";
    inner.innerHTML = "";

    // indicators
    let indicatorsHTML = "";
    activities.forEach((item, idx) => {
      const isActive =
        idx === initialActiveIndex ? ' class="active" aria-current="true"' : "";
      indicatorsHTML += `
        <button type="button" 
                data-bs-target="#activities_list" 
                data-bs-slide-to="${idx}" 
                aria-label="Slide ${idx + 1}"${isActive}>
        </button>
      `;
    });
    indicators.innerHTML = indicatorsHTML;

    // slides
    let slidesHTML = "";
    activities.forEach((item, idx) => {
      const isActive = idx === initialActiveIndex ? " active" : "";
      const color = item.color || "#b41e22";
      const topicNo = item.heading?.no || "";
      const topicTitle = item.heading?.title || "";
      const topicRomaji = item.heading?.romaji || "";
      const topicMeaning = item.heading?.meaning || "";
      const topicImage = item.topicImageUrl || "";

      // lessons
      let lessonsHTML = "";
      (item.lessons || []).forEach((lesson) => {
        let candosHTML = "";
        (lesson.candos || []).forEach((cando) => {
          candosHTML += `
            <li>
              <h3>Can-do ${cando.no || ""}</h3>
              <a href="${
                `can-do.html?no=${cando.no}` || "#"
              }" target="_blank" rel="noopener noreferrer">
                ${cando.title || ""}
              </a>
            </li>
          `;
        });

        lessonsHTML += `
          <div class="lesson-card">
            <div class="lesson-heading">
              Lesson ${lesson.heading.no} ${lesson.heading.title || ""}
            </div>
            <ul class="cando-list">
              ${candosHTML}
            </ul>
          </div>
        `;
      });

      slidesHTML += `
        <div class="carousel-item${isActive}" style="--accent-color: ${color}">
          <img class="d-block w-100 carousel-bg" 
               src="${topicImage}" 
               alt="${topicTitle}"
               loading="lazy">
          <div class="carousel-content">
            <div class="container pb-4">
              <div class="row">
                <div class="col-md-5">
                  <div class="topic-heading">
                    <div class="topic-no">Topic ${topicNo}</div>
                    <h3 class="topic-title">${topicTitle}</h3>
                    <div class="topic-roman">${topicRomaji} — ${topicMeaning}</div>
                  </div>
                </div>
                <div class="col-md-11">
                  <div class="lessons-grid">
                    ${lessonsHTML}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    inner.innerHTML = slidesHTML;

    setTimeout(equalizeCarouselHeights, 100);

    console.log(`Rendered ${activities.length} topics successfully`);
  }

  function equalizeCarouselHeights() {
    try {
      const carousels = document.querySelectorAll(".carousel");

      carousels.forEach((carousel) => {
        const items = carousel.querySelectorAll(".carousel-item");
        if (!items || items.length === 0) return;

        items.forEach((item) => (item.style.height = ""));

        let maxHeight = 0;
        items.forEach((item) => {
          const height =
            item.getBoundingClientRect().height || item.offsetHeight || 0;
          if (height > maxHeight) maxHeight = height;
        });

        if (maxHeight > 0) {
          items.forEach((item) => (item.style.height = maxHeight + "px"));
        }
      });
    } catch (e) {
      console.error("Error equalizing carousel heights:", e);
    }
  }

  function debounce(fn, wait) {
    let timeout = null;
    return function (...args) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const debouncedEqualize = debounce(equalizeCarouselHeights, 120);

  async function fetchCanDos(lessonId) {
    const res = await fetch(`${API_BASE_URL}/can-do/by-lesson/${lessonId}`);
    if (!res.ok)
      throw new Error(`Failed to fetch can-dos for lesson ${lessonId}`);
    const data = await res.json();

    return data.map((cd) => ({
      no: cd.orderGlobal,
      title: cd.subtitle,
      id: cd.id,
    }));
  }

  async function fetchLessons(topicId) {
    const res = await fetch(`${API_BASE_URL}/lessons/by-topic/${topicId}`);
    if (!res.ok)
      throw new Error(`Failed to fetch lessons for topic ${topicId}`);
    const data = await res.json();

    const lessonsWithCanDosPromises = data.map(async (lesson) => {
      const candos = await fetchCanDos(lesson.id);

      return {
        heading: {
          no: lesson.lessonNumber,
          title: lesson.title,
        },
        candos: candos,
      };
    });

    return Promise.all(lessonsWithCanDosPromises);
  }

  async function fetchAndMapData() {
    try {
      const topicRes = await fetch(`${API_BASE_URL}/topics`);
      if (!topicRes.ok) throw new Error("Failed to fetch topics");
      const topicData = await topicRes.json();

      const sortedTopics = topicData.content.sort(
        (a, b) => a.orderIndex - b.orderIndex
      );

      const activitiesPromises = sortedTopics.map(async (topic) => {
        const lessons = await fetchLessons(topic.id);

        return {
          id: topic.id,
          active: false,
          color: topic.hexColor,
          topicImageUrl: topic.thumbnail,
          heading: {
            no: topic.orderIndex,
            title: topic.title,
            romaji: topic.titleRomaji,
            meaning: topic.titleEn,
          },
          lessons: lessons,
        };
      });

      const activities = await Promise.all(activitiesPromises);

      console.log("Full mapped data:", activities);

      if (!activities.length) {
        console.warn("No activities found");
        return;
      }

      // Render
      renderActivities(activities, 0);
    } catch (error) {
      console.error("Error loading data chain:", error);
      const inner = document.getElementById("activities_inner");
      if (inner) {
        inner.innerHTML = `
            <div class="carousel-item active">
              <div class="alert alert-danger m-4" role="alert">
                <h4 class="alert-heading">Connection Error</h4>
                <p>Could not load learning content from the server.</p>
                <hr>
                <p class="mb-0">Error: ${error.message}</p>
              </div>
            </div>
          `;
      }
    }
  }

  window.addEventListener("load", debouncedEqualize);
  window.addEventListener("resize", debouncedEqualize);

  document.addEventListener(
    "load",
    function (e) {
      const target = e.target;
      if (
        target &&
        target.tagName === "IMG" &&
        target.closest &&
        target.closest(".carousel")
      ) {
        debouncedEqualize();
      }
    },
    true
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchAndMapData);
  } else {
    fetchAndMapData();
  }
})();
