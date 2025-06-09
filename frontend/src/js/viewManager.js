// viewManager.js - Handles view switching and content loading
document.addEventListener("DOMContentLoaded", function () {
  // Get all tab elements
  const tabs = document.querySelectorAll(".tab");

  // Get all view elements
  const views = document.querySelectorAll(".view-content");

  // Map tab elements to their corresponding views
  tabs.forEach((tab, index) => {
    const viewIds = ["home-view", "search-view", "calendar-view", "tasks-view"];
    if (index < viewIds.length) {
      tab.setAttribute("data-view", viewIds[index]);
    }
  });

  // Function to load home content
  async function loadHomeContent() {
    const homeView = document.getElementById("home-view");
    try {
      const response = await fetch("home.html");
      if (!response.ok) {
        throw new Error(`Failed to load home.html: ${response.status}`);
      }
      const html = await response.text();
      homeView.innerHTML = html;
    } catch (error) {
      console.error("Error loading home content:", error);
      homeView.innerHTML = `
              <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Welcome to Comet Notes</h2>
                <p class="mb-3">There was an error loading the home page content.</p>
                <p>Make sure home.html exists in your project directory.</p>
              </div>
            `;
    }
  }

  // Load home content initially
  loadHomeContent();

  // Function to switch to a specific view - make it available globally
  window.switchToView = function switchToView(viewId) {
    document
      .querySelectorAll(".view-content")
      .forEach((v) => v.classList.add("hidden"));
    document.getElementById(viewId)?.classList.remove("hidden");

    // Hide all views
    views.forEach((view) => {
      view.classList.add("hidden");
    });

    // Show the target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.remove("hidden");
    }

    // Update the header based on the view
    updateHeader(viewId);

    // Reload home content if needed
    if (viewId === "home-view") {
      const homeView = document.getElementById("home-view");
      if (
        homeView.innerHTML.trim() === "" ||
        homeView.innerHTML.includes("error loading")
      ) {
        loadHomeContent();
      }
    }

    // 🎯 Fix for FullCalendar layout glitch
    if (viewId === "calendar-view" && window.fullCalendarInstance) {
      setTimeout(() => {
        window.fullCalendarInstance.updateSize();
      }, 50);
    }

    // Handle tab styling
    if (viewId !== "editor-view") {
      tabs.forEach((t) => t.classList.remove("bg-gray-200"));

      tabs.forEach((tab) => {
        if (tab.getAttribute("data-view") === viewId) {
          tab.classList.add("bg-gray-200");
        }
      });

      document
        .querySelectorAll(".page-list li")
        .forEach((item) => item.classList.remove("bg-gray-200"));
    }
  };

  // Function to update the header based on the view
  function updateHeader(viewId) {
    const noteTitle = document.getElementById("note-title");

    if (viewId === "editor-view") {
      if (noteTitle) {
        noteTitle.style.display = "block";
      }
    } else {
      if (noteTitle) {
        noteTitle.style.display = "none";
      }
      // (Optional) You could update a view-specific title here
    }
  }

  // Tab click event: clear active state from page items and set active styling on tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const viewId = this.getAttribute("data-view");
      switchToView(viewId);
    });
  });

  // Setup page listeners: when a page is clicked, mark it as active and switch to editor view
  function setupPageListeners() {
    const pageItems = document.querySelectorAll(".page-list li");
    pageItems.forEach((page) => {
      page.addEventListener("click", function () {
        // Switch to editor view
        switchToView("editor-view");

        // Remove active state from all page items
        document
          .querySelectorAll(".page-list li")
          .forEach((item) => item.classList.remove("bg-gray-200"));

        // Add active state to the clicked page item
        this.classList.add("bg-gray-200");

        // Remove active state from tabs
        tabs.forEach((tab) => tab.classList.remove("bg-gray-200"));
      });
    });
  }

  // Initialize page listeners
  setupPageListeners();

  // Setup observers for dynamically added page items and reapply listeners
  const notesContainer = document.getElementById("notes-container");
  if (notesContainer) {
    const observer = new MutationObserver(function (mutations) {
      let pageAdded = false;
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          pageAdded = true;
          setupPageListeners();
        }
      });
      // If a page was added and home is still active, switch to the editor view
      if (
        pageAdded &&
        document.getElementById("home-view").classList.contains("hidden") ===
          false
      ) {
        const firstPage = document.querySelector(".page-list li");
        if (firstPage) {
          firstPage.click();
          // Make sure the page item is visually marked as active
          firstPage.classList.add("bg-gray-200");
        }
      }
    });

    observer.observe(notesContainer, { childList: true, subtree: true });
  }

  // Observer for page list to maintain active state when pages are added/removed
  const pageLists = document.querySelectorAll(".page-list");
  if (pageLists.length > 0) {
    pageLists.forEach((pageList) => {
      const pageObserver = new MutationObserver(function () {
        // Get current note ID from script.js if available
        if (window.currentNoteId) {
          const activeNote = document.querySelector(
            `[data-note-id="${window.currentNoteId}"]`
          );
          if (activeNote) {
            // Remove active state from all page items
            document
              .querySelectorAll(".page-list li")
              .forEach((item) => item.classList.remove("bg-gray-200"));
            // Add active state to the current note
            activeNote.classList.add("bg-gray-200");
          }
        }
      });

      pageObserver.observe(pageList, { childList: true, subtree: true });
    });
  }

  // On initial load, skip waiting and immediately try to find a page
  // Find the first page in the list
  const firstPageItem = document.querySelector(".page-list li");
  if (firstPageItem) {
    // If a page exists, simulate a click on it and make sure it's visually marked as active
    firstPageItem.click();
    firstPageItem.classList.add("bg-gray-200");
  } else {
    // If no pages exist yet, we need to observe for them to be added
    // For now, fallback to home view
    if (tabs.length > 0) {
      tabs[0].click();
    }

    // Set up an observer to wait for pages to be added
    const pagesContainer = document.querySelector(".page-list");
    if (pagesContainer) {
      const pageObserver = new MutationObserver(function (mutations) {
        const firstAddedPage = document.querySelector(".page-list li");
        if (firstAddedPage) {
          firstAddedPage.click();
          firstAddedPage.classList.add("bg-gray-200");
          pageObserver.disconnect(); // Disconnect once we've handled the first page
        }
      });

      pageObserver.observe(pagesContainer, { childList: true });
    }
  }
});
