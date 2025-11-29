(function () {
  "use strict";

  const container = document.querySelector("#hiragana .char_list");
  if (!container) return;

  const items = Array.from(container.querySelectorAll("li"));
  const active = { audio: null, button: null };

  function setActive(button, audio) {
    if (active.audio && active.audio !== audio) {
      active.audio.pause();
      active.audio.currentTime = 0;
      if (active.button) {
        active.button.classList.remove("is-playing");
        active.button.removeAttribute("aria-pressed");
      }
    }
    active.audio = audio;
    active.button = button;
  }

  function playAudio(button, audio) {
    if (!audio) return;
    // Restart if same audio already playing
    if (!audio.paused) {
      audio.currentTime = 0;
    } else {
      setActive(button, audio);
      audio.play().catch((err) => {
        console.warn("Audio play failed", err);
      });
    }
    button.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
  }

  function onEnded(button) {
    button.classList.remove("is-playing");
    button.removeAttribute("aria-pressed");
    if (active.button === button) {
      active.button = null;
      active.audio = null;
    }
  }

  items.forEach((li) => {
    const button = li.querySelector("button");
    const audio = li.querySelector("audio");
    if (!button || !audio) return;

    // Preload explicitly (some browsers ignore preload attr sometimes)
    try {
      audio.load();
    } catch (e) {}

    // Improve accessibility
    if (!button.hasAttribute("type")) button.setAttribute("type", "button");
    button.setAttribute("aria-label", "Play sound");

    button.addEventListener("click", () => playAudio(button, audio));

    button.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        playAudio(button, audio);
      }
    });

    audio.addEventListener("ended", () => onEnded(button));
    audio.addEventListener("pause", () => {
      if (audio.currentTime === 0) {
        // Reset state only if fully reset
        button.classList.remove("is-playing");
        button.removeAttribute("aria-pressed");
      }
    });
  });

  // Optional: stop playback when user navigates away (SPA or modal closures)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active.audio) {
      active.audio.pause();
    }
  });
})();
