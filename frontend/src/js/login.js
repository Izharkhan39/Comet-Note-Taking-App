// Function to handle login
async function login(identifier, password) {
  try {
    const res = await fetch("http://localhost:5002/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token); // Store token
      window.location.href = "/"; // Redirect to the main app
    } else {
      alert(data.message || "Login failed! Please check your credentials.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred. Please try again.");
  }
}

// Function to handle registration (now includes email)
async function register(username, email, password) {
  try {
    const res = await fetch("http://localhost:5002/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok && data.message) {
      alert("Registration successful! Please login.");
      showLoginForm(); // Switch to login after successful registration
    } else {
      alert(data.message || "Registration failed. Try again.");
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("An error occurred. Please try again.");
  }
}

// Function to show the register form and hide login form
function showRegisterForm() {
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("register-container").classList.remove("hidden");
}

// Function to show the login form and hide register form
function showLoginForm() {
  document.getElementById("register-container").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
}

// Attach event listeners
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;
  login(identifier, password);
});

document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  register(username, email, password);
});

document.getElementById("register-link").addEventListener("click", (e) => {
  e.preventDefault(); // Prevents the page from navigating away
  showRegisterForm();
});

document.getElementById("login-link").addEventListener("click", (e) => {
  e.preventDefault(); // Prevents the page from navigating away
  showLoginForm();
});

// Google sign in
document.getElementById("google-login").addEventListener("click", () => {
  window.location.href = "http://localhost:5002/api/auth/google";
});
