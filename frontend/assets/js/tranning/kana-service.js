(function (global) {
  "use strict";

  const _cache = {
    hiragana: null,
    katakana: null,
  };

  const _pendingPromises = {
    hiragana: null,
    katakana: null,
  };

  function getBaseUrl() {
    return getApiUrl("");
  }

  /**
   * @param {string} type
   * @returns {Promise<any>}
   */
  async function getData(type) {
    if (type !== "hiragana" && type !== "katakana") {
      throw new Error("Invalid Kana type");
    }

    if (_cache[type]) {
      return _cache[type];
    }

    if (_pendingPromises[type]) {
      return _pendingPromises[type];
    }

    const url = `${getBaseUrl()}/kana/${type}`;

    _pendingPromises[type] = (async () => {
      try {
        let response;
        if (typeof handleApiResponse === "function") {
          response = await fetch(url).then(handleApiResponse);
        } else {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
          response = await res.json();
        }

        // Save to cache
        _cache[type] = response;
        return response;
      } catch (error) {
        _pendingPromises[type] = null;
        throw error;
      }
    })();

    return _pendingPromises[type];
  }

  global.KanaService = {
    getData,
  };
})(window);
