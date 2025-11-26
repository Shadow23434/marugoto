// Initialize "Next step" button after static load and dynamic render
(function () {
  function bindNextStep() {
    const nextBtn = document.querySelector(
      'button.cando_navi_btn.w-100[href="#step2"]'
    );
    if (!nextBtn || nextBtn.dataset.nextStepInitialized === "true") return;
    nextBtn.dataset.nextStepInitialized = "true";

    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    function smoothScrollTo(toY, duration = 600, callback) {
      if ("scrollBehavior" in document.documentElement.style) {
        window.scrollTo({ top: toY, behavior: "smooth" });
        if (typeof callback === "function") {
          setTimeout(callback, duration);
        }
        return;
      }

      const startY = window.pageYOffset || document.documentElement.scrollTop;
      const change = toY - startY;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutQuad(progress);
        window.scrollTo(0, Math.round(startY + change * eased));
        if (elapsed < duration) {
          requestAnimationFrame(step);
        } else if (typeof callback === "function") {
          callback();
        }
      }

      requestAnimationFrame(step);
    }

    nextBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const target = document.getElementById("step2");
      if (!target) {
        location.hash = "#step2";
        return;
      }

      const duration = parseInt(
        nextBtn.getAttribute("data-scroll-duration") || "600",
        10
      );
      const offset = parseInt(
        nextBtn.getAttribute("data-scroll-offset") || "0",
        10
      );

      const targetY =
        window.pageYOffset + target.getBoundingClientRect().top - offset;

      smoothScrollTo(targetY, duration, () => {
        if (history.pushState) {
          history.pushState(null, "", "#step2");
        } else {
          location.hash = "#step2";
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindNextStep);
  } else {
    bindNextStep();
  }

  document.addEventListener("canDo:rendered", bindNextStep);
})();
