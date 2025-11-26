// Handle thumbnail clicks to change the main practice video (step1)
(function () {
  function deriveBaseFromThumb(src) {
    // Expect something like: assets/movies/thumbnail/topics/cando_01_02.jpg
    if (!src) return null;
    const m = src.match(/([^\/]+)\.(jpg|jpeg|png|webp)(?:\?.*)?$/i);
    return m ? m[1] : null;
  }

  function updateVideoSources(video, base) {
    if (!video || !base) return false;
    try {
      const mp4 = video.querySelector("source.mp4");
      const webm = video.querySelector("source.webm");
      // Use absolute paths to match existing markup
      const poster = `/assets/movies/thumbnail/topics/${base}.jpg`;
      const mp4Src = `/assets/movies/topics/mp4/${base}.mp4`;
      const webmSrc = `/assets/movies/topics/webm/${base}.webm`;

      if (mp4) mp4.src = mp4Src;
      if (webm) webm.src = webmSrc;
      video.setAttribute("poster", poster);

      // Reset and load the new sources
      video.pause();
      try {
        video.currentTime = 0;
      } catch (_) {}
      video.load();

      // Notify other modules (e.g., captions) that the video has changed
      const ev = new CustomEvent("canDo:videoChanged", {
        detail: { video, mode: "renshu", base },
      });
      document.dispatchEvent(ev);

      return true;
    } catch (err) {
      console.error("[movie-changer] Failed to update sources:", err);
      return false;
    }
  }

  function bindChanger() {
    const changer = document.querySelector("#step1 .cando_movie_changer ul");
    const video = document.getElementById("video");
    if (!changer || !video) return;

    if (changer.dataset.changerInitialized === "true") return;
    changer.dataset.changerInitialized = "true";

    // Delegate click to <li>
    changer.addEventListener("click", function (e) {
      const li = e.target.closest("li");
      if (!li || !changer.contains(li)) return;
      if (li.classList.contains("active")) return;

      const img = li.querySelector("img");
      const base = deriveBaseFromThumb(img?.getAttribute("src") || "");
      if (!base) return;

      // Toggle active state
      changer
        .querySelectorAll("li.active")
        .forEach((n) => n.classList.remove("active"));
      li.classList.add("active");

      // Update the main video
      updateVideoSources(video, base);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindChanger);
  } else {
    bindChanger();
  }

  document.addEventListener("canDo:rendered", bindChanger);
})();
