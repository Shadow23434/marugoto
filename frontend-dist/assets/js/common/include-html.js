document.addEventListener("DOMContentLoaded", function () {
  const includeEls = document.querySelectorAll("[data-include]");
  includeEls.forEach(async function (el) {
    const url = el.getAttribute("data-include");
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed: " + res.status);
      const html = await res.text();
      el.innerHTML = html;

      const scripts = el.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const script = document.createElement("script");
        if (oldScript.src) {
          script.src = oldScript.src;
          script.async = false;
        } else {
          script.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(script, oldScript);
      });
    } catch (err) {
      console.error("include-html error loading", url, err);
    }
  });
});
