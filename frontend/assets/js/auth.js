document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("tab-login");
  const registerBtn = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const buttons = document.querySelectorAll(".auth-tab-btn");
  const forms = document.querySelectorAll(".form-section");

  function toggleLoading(button, isLoading) {
    if (isLoading) {
      button.setAttribute("data-original-text", button.innerHTML);
      button.disabled = true;
      button.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
    } else {
      button.disabled = false;
      button.innerHTML = button.getAttribute("data-original-text");
    }
  }

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

  if (loginForm) {
    const form = loginForm.querySelector("form");
    if (form) {
      form.onsubmit = async function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("loginUsername");
        const passwordInput = document.getElementById("loginPassword");
        const username = usernameInput.value;
        const password = passwordInput.value;
        const submitBtn = form.querySelector('button[type="submit"]');

        toggleLoading(submitBtn, true);

        try {
          const url = getApiUrl("/api/auth/login");
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await handleApiResponse(response);

          // Save token and user info
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("userRole", data.role);
          localStorage.setItem("username", data.username);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("isLoggedIn", "true");

          if (typeof Toast !== "undefined") {
            Toast.success("Login successful! Redirecting...");
            setTimeout(() => {
              window.location.href = "index.html";
            }, 1000);
          } else {
            window.location.href = "index.html";
          }
        } catch (error) {
          console.error("Error:", error);
          showApiError(error.message);
          toggleLoading(submitBtn, false);
        }
      };
    }
  }

  if (registerForm) {
    const form = registerForm.querySelector("form");
    if (form) {
      form.onsubmit = async function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("regUsername");
        const passwordInput = document.getElementById("regPassword");
        const confirmPasswordInput =
          document.getElementById("regConfirmPassword");

        const username = usernameInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (password !== confirmPassword) {
          if (typeof Toast !== "undefined") {
            Toast.error("Passwords do not match!");
          } else {
            alert("Passwords do not match!");
          }
          return;
        }

        toggleLoading(submitBtn, true);

        try {
          const url = getApiUrl("/api/auth/register");
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          await handleApiResponse(response);

          if (typeof Toast !== "undefined") {
            Toast.success("Registration successful! Please login.");
          } else {
            alert("Registration successful! Please login.");
          }

          // Switch to login tab
          switchTab("login");

          // Clear form
          form.reset();
          toggleLoading(submitBtn, false);
        } catch (error) {
          console.error("Error:", error);
          showApiError(error.message);
          toggleLoading(submitBtn, false);
        }
      };
    }
  }
});
