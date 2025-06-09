// headerMenu.js

// Toggle the pop-up menu when clicking the header
document
  .getElementById("sidebar-header")
  .addEventListener("click", function (e) {
    // Prevent the event from propagating to document click
    e.stopPropagation();
    const popupMenu = document.getElementById("header-popup-menu");
    popupMenu.classList.toggle("hidden");
  });

// Hide the menu when clicking anywhere else in the document
document.addEventListener("click", function () {
  const popupMenu = document.getElementById("header-popup-menu");
  if (!popupMenu.classList.contains("hidden")) {
    popupMenu.classList.add("hidden");
  }
});

// Log Out option: clear token, terminate Google session, and redirect to login page
document
  .getElementById("logout-option")
  .addEventListener("click", function (e) {
    e.stopPropagation();

    // Clear local token
    localStorage.removeItem("token");

    // Create an iframe to Google's logout URL to terminate the Google session
    // This method avoids a full redirect to Google and then back to your site
    const googleLogoutURL = "https://accounts.google.com/logout";
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = googleLogoutURL;

    document.body.appendChild(iframe);

    // Give the iframe a moment to load, then redirect to login page
    setTimeout(function () {
      document.body.removeChild(iframe);
      window.location.href = "/login.html";
    }, 500);
  });

// Add Another Account option: redirect to Google sign-in with force prompt
document
  .getElementById("add-account-option")
  .addEventListener("click", function (e) {
    e.stopPropagation();
    localStorage.removeItem("token");

    // Redirect directly to your Google auth endpoint with specific options
    window.location.href = "/login.html";
  });

// // Settings option: navigate to the settings page (or open a settings modal)
// document
//   .getElementById("settings-option")
//   .addEventListener("click", function (e) {
//     e.stopPropagation();
//     document.getElementById("settings-modal").classList.remove("hidden");
//   });

// document
//   .getElementById("close-settings")
//   .addEventListener("click", function () {
//     document.getElementById("settings-modal").classList.add("hidden");
//   });
