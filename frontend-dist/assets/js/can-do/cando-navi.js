(function () {
  function toggleMenu(btn, nav) {
    if (!btn || !nav) return;
    const openSpan = btn.querySelector(".open");
    const closeSpan = btn.querySelector(".close");
    const isOpen = nav.classList.contains("show");

    if (isOpen) {
      nav.classList.remove("show");
      nav.classList.add("hide");
      setTimeout(() => nav.classList.remove("hide"), 400);
      if (openSpan) openSpan.style.display = "inline-block";
      if (closeSpan) closeSpan.style.display = "none";
      btn.classList.remove("active");
    } else {
      nav.classList.add("show");
      if (openSpan) openSpan.style.display = "none";
      if (closeSpan) closeSpan.style.display = "inline-block";
      btn.classList.add("active");
    }
  }

  function findPairFromButton(btn) {
    if (!btn) return { btn: null, nav: null };
    const parent = btn.parentElement || document;
    // Only treat as navigator button if it has both .open and .close labels
    if (!btn.querySelector(".open") || !btn.querySelector(".close")) {
      return { btn: null, nav: null };
    }
    // Prefer sibling .cando_navi under same parent container
    const nav =
      parent.querySelector(":scope > .cando_navi") ||
      parent.querySelector(".cando_navi");
    return { btn, nav };
  }

  // Event delegation so it works even if elements are added later
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".cando_navi_btn");
    if (!btn) return;
    const { btn: b, nav } = findPairFromButton(btn);
    if (!b || !nav) return; // ignore other buttons like "Next step"
    e.preventDefault();
    e.stopPropagation();
    toggleMenu(b, nav);
  });

  // Optional: initialize state when can-do block is rendered
  document.addEventListener("canDo:rendered", function () {
    const btn = document.querySelector(".container.mt-4 > .cando_navi_btn");
    const nav = document.querySelector(".container.mt-4 > .cando_navi");
    if (btn && nav) {
      // Ensure default state is closed
      nav.classList.remove("show", "hide");
      const openSpan = btn.querySelector(".open");
      const closeSpan = btn.querySelector(".close");
      if (openSpan) openSpan.style.display = "inline-block";
      if (closeSpan) closeSpan.style.display = "none";
      btn.classList.remove("active");
    }
  });
})();
