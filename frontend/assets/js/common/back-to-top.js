document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;

  const SHOW_AFTER = 200;

  function updateVisibility() {
    if (window.scrollY > SHOW_AFTER) {
      btn.classList.add("show");
      btn.removeAttribute("hidden");
      btn.setAttribute("aria-hidden", "false");
    } else {
      btn.classList.remove("show");
      btn.setAttribute("aria-hidden", "true");
      btn.setAttribute("hidden", "");
    }
  }

  updateVisibility();

  window.addEventListener("scroll", updateVisibility, { passive: true });

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
