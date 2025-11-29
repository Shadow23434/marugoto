(function () {
  "use strict";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function closest(el, sel) {
    try {
      return el && el.closest(sel);
    } catch (_) {
      return null;
    }
  }

  function wireTopicsNavi() {
    // Elements are injected dynamically by can-do.js after data loads
    const btn = $(".topics_navi_btn");
    const list = $(".topics_navi_list");
    if (!btn || !list) return;
    if (list.dataset.topicsNaviWired === "true") return;

    const closeBtn = $(".topics_navi_close", list);
    const panel = list; // alias

    // Helpers
    const setAria = (open) =>
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    const openClass = "is-open"; // graceful default; CSS may already style this or we use [hidden]

    const openPanel = () => {
      panel.classList.add(openClass);
      btn.classList.add(openClass);
      panel.removeAttribute("hidden");
      setAria(true);
      // Optional: focus the first focusable element (close button), if present
      if (closeBtn) {
        try {
          closeBtn.focus({ preventScroll: true });
        } catch (_) {}
      }
      document.addEventListener("click", onDocClick, { capture: true });
      document.addEventListener("keydown", onKeydown, { capture: true });
    };

    const closePanel = () => {
      panel.classList.remove(openClass);
      btn.classList.remove(openClass);
      if (!panel.hasAttribute("hidden")) panel.setAttribute("hidden", "");
      setAria(false);
      document.removeEventListener("click", onDocClick, { capture: true });
      document.removeEventListener("keydown", onKeydown, { capture: true });
    };

    const isOpen = () =>
      panel.classList.contains(openClass) && !panel.hasAttribute("hidden");

    const onDocClick = (e) => {
      // Close when clicking outside the button/panel
      const t = e.target;
      if (!t) return;
      if (closest(t, ".topics_navi_list") || closest(t, ".topics_navi_btn"))
        return;
      if (isOpen()) closePanel();
    };

    const onKeydown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (isOpen()) {
          e.stopPropagation();
          e.preventDefault();
          closePanel();
          try {
            btn.focus({ preventScroll: true });
          } catch (_) {}
        }
      }
    };

    // Toggle via button
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) {
        closePanel();
      } else {
        openPanel();
      }
    });

    // Close via explicit close button, if present
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closePanel();
      });
    }

    // Navigate when clicking the whole li
    const ul = $("ul", list) || list;

    // Click to navigate
    ul.addEventListener("click", (e) => {
      const li = closest(e.target, "li");
      if (!li) return;
      // Avoid interfering with default behavior if user clicked a link or used modifier keys
      const A = closest(e.target, "a[href]");
      const isModified =
        e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button === 1;
      if (A) {
        if (!isModified) {
          // Close panel after normal navigation click
          closePanel();
        }
        return; // let the anchor handle it naturally
      }
      const a = li.querySelector("a[href]");
      if (a && a.href) {
        e.preventDefault();
        closePanel();
        window.location.assign(a.href);
      }
    });

    // Keyboard: Enter/Space on an li should activate its link when focus isn't on an <a>
    ul.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const li = closest(e.target, "li");
      if (!li) return;
      if (closest(e.target, "a, button, input, select, textarea")) return; // let native controls handle
      const a = li.querySelector("a[href]");
      if (a && a.href) {
        e.preventDefault();
        closePanel();
        a.click();
      }
    });

    // Initialize hidden state if not explicitly styled yet
    if (!panel.classList.contains(openClass)) {
      panel.setAttribute("hidden", "");
      setAria(false);
    }

    list.dataset.topicsNaviWired = "true";
  }

  // Initial wiring after can-do content is rendered
  document.addEventListener("canDo:rendered", wireTopicsNavi);

  // Fallback: if markup is already in the DOM for any reason
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireTopicsNavi);
  } else {
    wireTopicsNavi();
  }
})();
