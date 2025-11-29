function hexToRgb(hex) {
  hex = hex.trim().replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

const root = document.documentElement;
const accentHex =
  getComputedStyle(root).getPropertyValue("--accent-color").trim() || "#b41e22";
const [r, g, b] = hexToRgb(accentHex);
root.style.setProperty("--accent-color-rgb", `${r} ${g} ${b}`);
