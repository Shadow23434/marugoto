(function () {
  "use strict";

  function createSlide(imgSrc, idx) {
    const slide = document.createElement("div");
    slide.className = "carousel-item" + (idx === 0 ? " active" : "");
    const img = document.createElement("img");
    img.className = "d-block w-100 carousel-bg";
    img.src = imgSrc;
    img.alt = `Life and Culture ${idx + 1}`;
    img.loading = "lazy";
    slide.appendChild(img);
    return slide;
  }

  function renderLifeCulture(initialActiveIndex = 0) {
    const indicators = document.getElementById("lifeculture_indicators");
    const inner = document.getElementById("lifeculture_inner");
    const carouselId = "#lifeculture a.carousel";
    if (!indicators || !inner) return;
    indicators.innerHTML = "";
    inner.innerHTML = "";

    const base = "assets/images/index/lifeculture_";
    const ext = ".jpg";
    const count = 5;

    for (let i = 0; i < count; i++) {
      const idx = i;
      const num = String(i + 1).padStart(2, "0");
      const src = base + num + ext;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-bs-target", carouselId);
      btn.setAttribute("data-bs-slide-to", String(idx));
      btn.setAttribute("aria-label", `Slide ${idx + 1}`);
      if (idx === initialActiveIndex) {
        btn.className = "active";
        btn.setAttribute("aria-current", "true");
      }
      indicators.appendChild(btn);

      const slide = createSlide(src, idx);
      if (idx === initialActiveIndex) slide.classList.add("active");
      else slide.classList.remove("active");
      inner.appendChild(slide);
    }

    try {
      const carouselEl = document.querySelector(carouselId);
      if (window.bootstrap && carouselEl) {
        const existing = bootstrap.Carousel.getInstance(carouselEl);
        if (existing && typeof existing.dispose === "function")
          existing.dispose();
        const carousel = new bootstrap.Carousel(carouselEl, { ride: false });
        if (typeof carousel.to === "function") carousel.to(initialActiveIndex);
        try {
          if (
            carouselEl.getAttribute &&
            (carouselEl.getAttribute("data-bs-ride") === "carousel" ||
              carouselEl.hasAttribute("data-bs-interval"))
          ) {
            if (typeof carousel.cycle === "function") carousel.cycle();
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn("lifeculture carousel init failed:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderLifeCulture(0);
  });
})();
