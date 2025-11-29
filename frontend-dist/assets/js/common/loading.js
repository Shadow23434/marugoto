(function () {
  const loader = document.getElementById("page-loader");

  function waitForWindowLoad(timeoutMs = 8000) {
    return new Promise((resolve) => {
      console.debug("loader: waitForWindowLoad start", {
        readyState: document.readyState,
        timeoutMs,
      });
      if (document.readyState === "complete") return resolve({ success: true });
      let resolved = false;

      const onLoad = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        console.debug("loader: window load event fired");
        resolve({ success: true });
      };

      window.addEventListener("load", onLoad, { once: true });

      const timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener("load", onLoad);
        console.warn(
          "loader: waitForWindowLoad timed out after",
          timeoutMs,
          "ms"
        );
        resolve({ success: false });
      }, timeoutMs);
    });
  }

  function waitForImagesToSettle({ settleMs = 300, timeoutMs = 8000 } = {}) {
    return new Promise((resolve) => {
      console.debug("loader: waitForImagesToSettle start", {
        settleMs,
        timeoutMs,
        totalImages: document.images.length,
      });
      const tracked = new Set();
      let pending = 0;
      let settleTimer = null;
      let finished = false;

      const resetSettle = () => {
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(checkFinished, settleMs);
        console.debug("loader: resetSettle called", { pending });
      };

      function checkFinished() {
        if (finished) return;
        if (pending === 0) {
          finished = true;
          observer.disconnect();
          clearTimeout(timeoutId);
          console.debug("loader: images settled (pending=0)");
          resolve({ success: true });
        }
      }

      function monitorImg(img) {
        if (tracked.has(img)) return;
        tracked.add(img);

        const loadingAttr = img.getAttribute && img.getAttribute("loading");
        if (loadingAttr === "lazy") return;
        if (img.hasAttribute && img.hasAttribute("data-src")) return;
        if (img.complete) return;

        pending++;
        console.debug("loader: monitorImg - added pending image", {
          src: img.src,
          pending,
        });

        const onDone = () => {
          if (img.__loader_handled) return;
          img.__loader_handled = true;
          pending = Math.max(0, pending - 1);
          console.debug("loader: image done (load/error)", {
            src: img.src,
            pending,
          });
          resetSettle();
        };

        img.addEventListener("load", onDone, { once: true });
        img.addEventListener("error", onDone, { once: true });
      }

      Array.from(document.images).forEach(monitorImg);

      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "childList") {
            m.addedNodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              if (node.tagName === "IMG") monitorImg(node);
              node.querySelectorAll &&
                node.querySelectorAll("img").forEach(monitorImg);
            });
          }
          if (
            m.type === "attributes" &&
            m.target &&
            m.target.tagName === "IMG"
          ) {
            monitorImg(m.target);
          }
        }
        resetSettle();
      });

      observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src"],
      });

      resetSettle();

      const timeoutId = setTimeout(() => {
        if (finished) return;
        finished = true;
        observer.disconnect();
        console.warn("loader: waitForImagesToSettle timed out", { pending });
        resolve({ success: false });
      }, timeoutMs);
    });
  }

  function showLoaderError(message) {
    if (!loader) return;
    loader.classList.add("loader-error");
    const spinner = loader.querySelector(".loader-spinner");
    const textEl = loader.querySelector(".loader-text");
    if (spinner) spinner.style.display = "none";
    if (textEl) textEl.textContent = message;
    console.error("loader: showLoaderError", message);
    if (!loader.querySelector(".loader-retry")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "loader-retry btn btn-primary mt-3";
      btn.textContent = "Retry";
      btn.addEventListener("click", () => {
        if (typeof runLoaderCycle === "function") runLoaderCycle();
        else window.location.reload();
      });
      loader.appendChild(btn);
    }
  }

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("loaded");
    const t = parseFloat(getComputedStyle(loader).transitionDuration) || 0.4;
    setTimeout(
      () => loader.parentNode && loader.parentNode.removeChild(loader),
      t * 1000 + 50
    );
  }

  function resetLoaderUI() {
    if (!loader) return;
    loader.classList.remove("loader-error");
    loader.classList.remove("loaded");
    const spinner = loader.querySelector(".loader-spinner");
    const textEl = loader.querySelector(".loader-text");
    if (spinner) spinner.style.display = "block";
    if (textEl) textEl.textContent = "Loading...";
    const retry = loader.querySelector(".loader-retry");
    if (retry) retry.remove();
  }

  function runLoaderCycle() {
    if (!loader) return;
    console.debug("loader: runLoaderCycle start");
    resetLoaderUI();
    return Promise.all([
      waitForWindowLoad(8000),
      waitForImagesToSettle({ settleMs: 300, timeoutMs: 10000 }),
    ]).then((results) => {
      console.debug("loader: runLoaderCycle results", results);
      const allOk = results.every((r) => r && r.success);
      if (allOk) {
        console.debug("loader: all checks passed, hiding loader");
        hideLoader();
        return;
      }
      const msgs = [];
      if (!results[0] || !results[0].success)
        msgs.push("Page failed to finish loading.");
      if (!results[1] || !results[1].success)
        msgs.push("Images did not finish loading.");
      const message = msgs.length ? msgs.join(" ") : "Loading failed.";
      showLoaderError(message + " Please check your connection and try again.");
    });
  }

  runLoaderCycle();
})();
