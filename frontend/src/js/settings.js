const settingsOption = document.getElementById("settings-option");
const settingsModal = document.getElementById("settings-modal");
const settingsContent = document.getElementById("settings-content");
const closeModal = document.getElementById("close-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const sidebarLinks = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".settings-section");

// Open Modal
settingsOption.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  settingsModal.classList.remove("hidden");
});

// Close Modal when clicking on close buttons
[closeModal, closeModalBtn].forEach((btn) =>
  btn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  })
);

// Close modal when clicking outside of modal content
settingsModal.addEventListener("click", (event) => {
  if (!settingsContent.contains(event.target)) {
    settingsModal.classList.add("hidden");
  }
});

// Sidebar Navigation (Toggle Sections)
sidebarLinks.forEach((link) => {
  link.addEventListener("click", () => {
    sections.forEach((section) => section.classList.add("hidden"));
    document.getElementById(link.dataset.section).classList.remove("hidden");
  });
});

// Dark Mode Toggle (Fix)
const darkModeToggle = document.getElementById("dark-mode-toggle");
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});
