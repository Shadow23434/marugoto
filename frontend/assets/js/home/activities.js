(function () {
  "use strict";

  function normalizeToActivities(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.topics)) return data.topics;
    if (data && Array.isArray(data.activities)) return data.activities;
    return [];
  }

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

        // Reset heights
        items.forEach((item) => (item.style.height = ""));

        // Find max height
        let maxHeight = 0;
        items.forEach((item) => {
          const height =
            item.getBoundingClientRect().height || item.offsetHeight || 0;
          if (height > maxHeight) maxHeight = height;
        });

        // Apply max height to all items
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

  function loadAndRender() {
    const dataUrl = "data/en/topics.json";

    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Topics data loaded:", data);

        const activities = normalizeToActivities(data);

        if (!activities.length) {
          console.warn("No activities found in topics data");
          return;
        }

        let initialActiveIndex = 0;
        const explicitActive = activities.findIndex(
          (a) => a && (a.active === true || a.active === "true")
        );
        if (explicitActive >= 0) {
          initialActiveIndex = explicitActive;
        }

        renderActivities(activities, initialActiveIndex);
      })
      .catch((error) => {
        console.error("Failed to load topics data:", error);

        const inner = document.getElementById("activities_inner");
        if (inner) {
          inner.innerHTML = `
            <div class="carousel-item active">
              <div class="alert alert-danger m-4" role="alert">
                <h4 class="alert-heading">Error Loading Topics</h4>
                <p>Failed to load topics data. Please check the console for details.</p>
                <hr>
                <p class="mb-0">Error: ${error.message}</p>
              </div>
            </div>
          `;
        }
      });
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
    document.addEventListener("DOMContentLoaded", loadAndRender);
  } else {
    loadAndRender();
  }
})();
