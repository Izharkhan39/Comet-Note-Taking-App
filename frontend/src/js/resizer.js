const sidebarContainer = document.getElementById("sidebar-container");
const resizer = document.getElementById("resizer");
const collapseBtn = document.getElementById("collapse-sidebar");
const expandBtn = document.getElementById("expand-sidebar");
const mainContent = document.getElementById("main-content");

const minWidth = 250;
const maxWidth = 500;
const defaultWidth = 350;

// Set initial width on page load
window.addEventListener("DOMContentLoaded", () => {
  // Check if we have a saved width in localStorage
  const savedWidth = localStorage.getItem("sidebarWidth");
  const savedState = localStorage.getItem("sidebarState");

  if (savedState === "collapsed") {
    // If sidebar was collapsed before refresh, keep it collapsed
    sidebarContainer.style.display = "none";
    resizer.style.display = "none";
    expandBtn.classList.remove("hidden");
    mainContent.style.marginLeft = "0";
  } else {
    // Set width to saved value or default
    const width = savedWidth ? parseInt(savedWidth) : defaultWidth;
    sidebarContainer.style.width = `${width}px`;
    sidebarContainer.style.minWidth = `${width}px`;
    sidebarContainer.style.flex = "0 0 auto";
    expandBtn.classList.add("hidden");
  }
});

let isResizing = false;

resizer.addEventListener("mousedown", (e) => {
  if (sidebarContainer.style.display === "none") return;
  isResizing = true;
  sidebarContainer.style.transition = "none";
  mainContent.style.transition = "none";
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", stopResizing);
});

function handleMouseMove(e) {
  if (!isResizing) return;

  // Disable text selection dynamically
  document.getElementById("editor-container").style.userSelect = "none";
  document.getElementById("editor-container").style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  let newWidth = e.clientX;
  if (newWidth < minWidth) newWidth = minWidth;
  if (newWidth > maxWidth) newWidth = maxWidth;
  sidebarContainer.style.width = `${newWidth}px`;
}

function stopResizing() {
  isResizing = false;
  sidebarContainer.style.transition = "width 0.3s";
  mainContent.style.transition = "margin-left 0.3s";

  // Save the current width to localStorage
  localStorage.setItem(
    "sidebarWidth",
    sidebarContainer.style.width.replace("px", "")
  );

  // Re-enable text selection dynamically
  document.getElementById("editor-container").style.userSelect = "";
  document.getElementById("editor-container").style.pointerEvents = "";

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", stopResizing);
}

// Collapse the sidebar
collapseBtn.addEventListener("click", () => {
  sidebarContainer.style.display = "none";
  resizer.style.display = "none";
  expandBtn.classList.remove("hidden");
  mainContent.style.marginLeft = "0";

  // Save collapsed state
  localStorage.setItem("sidebarState", "collapsed");
});

// Expand the sidebar
expandBtn.addEventListener("click", () => {
  // Get saved width or use default
  const savedWidth = localStorage.getItem("sidebarWidth");
  const width = savedWidth ? parseInt(savedWidth) : defaultWidth;

  sidebarContainer.style.display = "block";
  sidebarContainer.style.width = `${width}px`;
  resizer.style.display = "block";
  expandBtn.classList.add("hidden");

  // Save expanded state
  localStorage.setItem("sidebarState", "expanded");
});
