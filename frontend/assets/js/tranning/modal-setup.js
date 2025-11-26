(function () {
  "use strict";

  const modal = document.getElementById("modal_setup");
  if (!modal) return;

  // Inject close button if not present
  if (!modal.querySelector(".modal-close-btn")) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "modal-close-btn";
    closeBtn.setAttribute("aria-label", "Close dialog");
    closeBtn.innerHTML = '<span aria-hidden="true">×</span>';
    modal.insertBefore(closeBtn, modal.firstChild);

    closeBtn.addEventListener("click", closeModal);
  }

  let overlay = null;
  let lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    if (modal.classList.contains("is-open")) return;

    lastFocused = document.activeElement;

    // Create overlay
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.addEventListener("click", closeModal);
    document.body.appendChild(overlay);

    // Show modal
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    // Accessibility
    modal.setAttribute("aria-hidden", "false");
    modal.setAttribute("tabindex", "-1");
    modal.focus();

    // Event listeners
    document.addEventListener("keydown", onGlobalKey);
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    modal.setAttribute("aria-hidden", "true");

    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    document.removeEventListener("keydown", onGlobalKey);

    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  function onGlobalKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  }

  // Attach click listeners to triggers
  const triggers = document.querySelectorAll('a[href="#modal_setup"]');
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openModal);
  });
})();
