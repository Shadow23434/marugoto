/**
 * @param {Response} response -
 * @returns {Promise<any>}
 */
const handleApiResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const data = await response.json();
      errorMessage =
        data.message ||
        data.error ||
        `Error ${response.status}: ${response.statusText}`;
    } catch (e) {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }

    if (response.status === 401) {
      console.warn("Unauthorized access");
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * @param {string} message
 */
const showApiError = (message) => {
  if (typeof Toast !== "undefined") {
    Toast.error(message);
  } else {
    alert(message);
    console.error("API Error:", message);
  }
};
