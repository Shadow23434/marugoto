const getApiUrl = (endpoint) => {
  const port = window.location.port;

  if (port === "5500" || port === "5501") {
    return `http://localhost:8080${endpoint}`;
  }

  return endpoint;
};
