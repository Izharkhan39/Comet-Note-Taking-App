// Get a unique key for the current page using a data attribute (if available) or the URL
const pageKey = (
  document.body.dataset.pageId || window.location.pathname
).replace(/\//g, "_");

// DOM elements
const coverPlaceholder = document.getElementById("cover-placeholder");
const addCoverBtn = document.getElementById("add-cover-btn");
const coverImageContainer = document.getElementById("cover-image-container");
const coverImage = document.getElementById("cover-image");
const topControls = document.getElementById("top-controls");
const repositionBtn = document.getElementById("reposition-btn");
const removeCoverBtn = document.getElementById("remove-cover-btn");
const saveControls = document.getElementById("save-controls");
const savePositionBtn = document.getElementById("save-position-btn");
const repositionOverlay = document.getElementById("reposition-overlay");
const editorContainer = document.getElementById("editor-container");

// Variables for image repositioning
let isDragging = false;
let startY = 0;
let startTop = 0;
let imageHeight = 0;
let containerHeight = 200; // Fixed container height (should match your CSS)
let isRepositioning = false;

// Page-specific Local storage keys
const STORAGE_KEY_IMAGE = `cover_image_data_${pageKey}`;
const STORAGE_KEY_POSITION = `cover_image_position_${pageKey}`;
const STORAGE_KEY_VISIBLE = `cover_image_visible_${pageKey}`;

// Utility: clamp a value between min and max
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Function to show cover image
function showCoverImage() {
  coverPlaceholder.classList.add("hidden");
  coverImageContainer.classList.remove("hidden");
  localStorage.setItem(STORAGE_KEY_VISIBLE, "true");
}

// Function to hide cover image
function hideCoverImage() {
  coverPlaceholder.classList.remove("hidden");
  coverImageContainer.classList.add("hidden");
  localStorage.setItem(STORAGE_KEY_VISIBLE, "false");
}

// Function to enter repositioning mode
function enterRepositionMode() {
  isRepositioning = true;
  repositionOverlay.classList.remove("hidden");
  topControls.classList.add("hidden");
  saveControls.classList.remove("hidden");

  // Enable dragging
  coverImage.style.cursor = "grab";
  document.body.style.userSelect = "none"; // Prevent text selection during drag

  // Get the current image height
  imageHeight = coverImage.naturalHeight || coverImage.clientHeight;

  // Update container height from the actual element
  containerHeight = coverImageContainer.clientHeight;
}

// Function to exit repositioning mode and save position
function exitRepositionMode() {
  isRepositioning = false;
  repositionOverlay.classList.add("hidden");
  topControls.classList.remove("hidden"); // Make controls visible again
  saveControls.classList.add("hidden");
  coverImage.style.cursor = "default";
  document.body.style.userSelect = "";
  isDragging = false;

  // Save the current position to local storage
  localStorage.setItem(STORAGE_KEY_POSITION, coverImage.style.top);
}

// Function to handle drag start
function handleDragStart(e) {
  if (!isRepositioning) return;

  isDragging = true;
  startY = e.clientY;
  // Get the current top value as a number (removing 'px' if present)
  startTop = parseInt(coverImage.style.top) || 0;

  // Change cursor to indicate active dragging
  coverImage.style.cursor = "grabbing";

  // Remove transition during drag for smooth movement
  coverImage.classList.add("dragging");

  // Prevent default behavior
  e.preventDefault();
}

// Function to handle dragging
function handleDrag(e) {
  if (!isDragging) return;

  const deltaY = e.clientY - startY;
  let newTop = startTop + deltaY;

  // Refresh measurements
  imageHeight = coverImage.naturalHeight || coverImage.clientHeight;
  containerHeight = coverImageContainer.clientHeight;

  if (imageHeight > containerHeight) {
    // Allow dragging within bounds for taller images
    const minTop = containerHeight - imageHeight; // Bottom limit (negative value)
    const maxTop = 0; // Top limit
    newTop = clamp(newTop, minTop, maxTop);
  } else {
    // For images smaller than the container, always center them
    newTop = (containerHeight - imageHeight) / 2;
  }

  coverImage.style.top = `${newTop}px`;
  e.preventDefault();
}

// Function to handle drag end
function handleDragEnd() {
  if (isDragging) {
    isDragging = false;
    coverImage.style.cursor = "grab";
    coverImage.classList.remove("dragging");
  }
}

// Function to save image to local storage
function saveImageToLocalStorage(dataUrl) {
  localStorage.setItem(STORAGE_KEY_IMAGE, dataUrl);
}

// Function to load image from local storage and adjust its position
function loadImageFromLocalStorage() {
  const imageUrl = localStorage.getItem(STORAGE_KEY_IMAGE);
  const savedPositionStr = localStorage.getItem(STORAGE_KEY_POSITION);
  const isVisible = localStorage.getItem(STORAGE_KEY_VISIBLE) === "true";

  if (imageUrl) {
    coverImage.src = imageUrl;
    coverImage.onload = function () {
      imageHeight = coverImage.naturalHeight;
      containerHeight = coverImageContainer.clientHeight;
      const defaultTop = (containerHeight - imageHeight) / 2;

      if (imageHeight > containerHeight) {
        const minTop = containerHeight - imageHeight;
        const maxTop = 0;

        let pos = parseInt(savedPositionStr, 10);
        if (isNaN(pos) || pos < minTop || pos > maxTop) {
          pos = defaultTop;
          localStorage.setItem(STORAGE_KEY_POSITION, pos + "px");
        }
        coverImage.style.top = pos + "px";
      } else {
        coverImage.style.top = defaultTop + "px";
        localStorage.setItem(STORAGE_KEY_POSITION, coverImage.style.top);
      }

      if (isVisible) {
        showCoverImage();
      }
    };
    return true;
  }

  return false;
}

// Function to handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    // Clear any stored position and image path
    localStorage.removeItem(STORAGE_KEY_POSITION);
    localStorage.removeItem(STORAGE_KEY_IMAGE);

    // Generate a blob URL (won't persist after refresh)
    const blobUrl = URL.createObjectURL(file);

    // Set image and store blob URL
    coverImage.src = blobUrl;
    localStorage.setItem(STORAGE_KEY_IMAGE, blobUrl);

    coverImage.onload = function () {
      imageHeight = coverImage.naturalHeight;
      containerHeight = coverImageContainer.clientHeight;

      // Always start at top 0
      const defaultTop = 0;
      coverImage.style.top = defaultTop + "px";
      localStorage.setItem(STORAGE_KEY_POSITION, coverImage.style.top);

      showCoverImage();
    };
  }
}

// Create hidden file input
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
fileInput.addEventListener("change", handleFileSelect);
document.body.appendChild(fileInput);

// Event Listeners
addCoverBtn.addEventListener("click", () => {
  fileInput.value = ""; // Clear input to allow re-selecting the same file
  fileInput.click();
});

removeCoverBtn.addEventListener("click", () => {
  hideCoverImage();
  // Clear image data and related info from localStorage
  localStorage.removeItem(STORAGE_KEY_IMAGE);
  localStorage.removeItem(STORAGE_KEY_POSITION);
  localStorage.removeItem(STORAGE_KEY_VISIBLE);

  // Optional: Clear the image src if you don’t want to show it again later
  coverImage.src = "";
});

repositionBtn.addEventListener("click", enterRepositionMode);
savePositionBtn.addEventListener("click", exitRepositionMode);

// Drag event listeners
coverImageContainer.addEventListener("mousedown", handleDragStart);
document.addEventListener("mousemove", handleDrag);
document.addEventListener("mouseup", handleDragEnd);

// Show controls on hover
coverImageContainer.addEventListener("mouseenter", function () {
  if (!isRepositioning) {
    topControls.classList.add("opacity-100");
  }
});
coverImageContainer.addEventListener("mouseleave", function () {
  if (!isRepositioning) {
    topControls.classList.remove("opacity-100");
  }
});

// Load saved image on startup
window.addEventListener("DOMContentLoaded", function () {
  loadImageFromLocalStorage();
});

// Update container height on window resize
window.addEventListener("resize", function () {
  containerHeight = coverImageContainer.clientHeight;
});
