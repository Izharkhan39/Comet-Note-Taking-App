// Get modal elements
const modal = document.getElementById("task-modal");
const closeBtn = document.getElementById("task-close-btn");
const cancelBtn = document.getElementById("cancel-btn");
const deleteBtn = document.getElementById("delete-task-btn");

// Open: modal.classList.remove("hidden")
// Close: modal.classList.add("hidden")
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));
