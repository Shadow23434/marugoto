class I18n {
  constructor() {
    this.currentLang =
      this.getLanguageFromURL() || this.getStoredLanguage() || "vi";
    this.translations = {
      cando: null,
      ui: null,
    };
  }

  // Lấy ngôn ngữ từ URL (ví dụ: ?lang=en)
  getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("lang");
  }

  // Lấy ngôn ngữ đã lưu trong localStorage
  getStoredLanguage() {
    return localStorage.getItem("language");
  }

  // Lưu ngôn ngữ
  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("language", lang);

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);
  }

  // Load translation files
  async loadTranslations() {
    try {
      const [candoRes, uiRes] = await Promise.all([
        fetch(`assets/data/cando/${this.currentLang}.json`),
        fetch(`assets/data/ui/${this.currentLang}.json`),
      ]);

      this.translations.cando = await candoRes.json();
      this.translations.ui = await uiRes.json();

      return true;
    } catch (error) {
      console.error("Error loading translations:", error);

      // Fallback to Vietnamese if error
      if (this.currentLang !== "vi") {
        this.currentLang = "vi";
        return this.loadTranslations();
      }
      return false;
    }
  }

  // Get translation
  t(key, type = "ui") {
    return this.translations[type]?.[key] || key;
  }

  // Get Can-Do content
  getCanDo(id) {
    return this.translations.cando?.[id] || null;
  }

  // Get current language
  getCurrentLanguage() {
    return this.currentLang;
  }
}

// Export instance
const i18n = new I18n();
