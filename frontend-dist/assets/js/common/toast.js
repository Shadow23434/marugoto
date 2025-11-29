/**
 * Toast Notification System
 */

const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - 'success', 'error', 'warning', 'info'
   * @param {string} title - Optional title
   * @param {number} duration - Duration in ms (default 3000)
   */
  show(message, type = "info", title = "", duration = 3000) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `toast-item ${type}`;

    // Icons based on type
    let iconClass = "fa-info-circle";
    if (type === "success") iconClass = "fa-check-circle";
    if (type === "error") iconClass = "fa-exclamation-circle";
    if (type === "warning") iconClass = "fa-exclamation-triangle";

    // Default titles if not provided
    if (!title) {
      if (type === "success") title = "Success";
      if (type === "error") title = "Error";
      if (type === "warning") title = "Warning";
      if (type === "info") title = "Info";
    }

    toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                &times;
            </button>
        `;

    this.container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add("hide");
      toast.addEventListener("animationend", () => {
        toast.remove();
      });
    }, duration);
  },

  success(message, title = "Success", duration = 3000) {
    this.show(message, "success", title, duration);
  },

  error(message, title = "Error", duration = 4000) {
    this.show(message, "error", title, duration);
  },

  warning(message, title = "Warning", duration = 3000) {
    this.show(message, "warning", title, duration);
  },

  info(message, title = "Info", duration = 3000) {
    this.show(message, "info", title, duration);
  },
};
