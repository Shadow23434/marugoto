document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("tab-login");
  const registerBtn = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const buttons = document.querySelectorAll(".auth-tab-btn");
  const forms = document.querySelectorAll(".form-section");

  function switchTab(tabName) {
    // Reset active states
    buttons.forEach((btn) => btn.classList.remove("active"));
    forms.forEach((form) => form.classList.remove("active"));

    if (tabName === "login") {
      loginBtn.classList.add("active");
      loginForm.classList.add("active");
    } else {
      registerBtn.classList.add("active");
      registerForm.classList.add("active");
    }
  }

  // Attach event listeners
  if (loginBtn) {
    loginBtn.addEventListener("click", function () {
      switchTab("login");
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", function () {
      switchTab("register");
    });
  }
});
