// script.js

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

import ImageTool from "@editorjs/image";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import CodeTool from "@rxpm/editor-js-code";

import Delimiter from "@editorjs/delimiter";
import UndoPlugin from "editorjs-undo";
import Warning from "@editorjs/warning";
import Alert from "editorjs-alert";

import InlineCode from "@editorjs/inline-code";
import ColorPicker from "editorjs-color-picker";
import ToggleBlock from "editorjs-toggle-block";
import DragDrop from "editorjs-drag-drop";
import Undo from "editorjs-undo";
import LinkTool from "@editorjs/link";
import Embed from "@editorjs/embed";
import AttachesTool from "@editorjs/attaches";
import Marker from "@editorjs/marker";
import Strikethrough from "@sotaproject/strikethrough";
import TextVariantTune from "@editorjs/text-variant-tune";

let editor;
let currentNoteId = null; // Holds the _id of the currently loaded note
let notes = []; // Global array to store notes fetched from the backend

const token = localStorage.getItem("token");
if (!token) {
  // Redirect to login page if no token is found
  window.location.href = "/login.html";
}

// Utility function to sanitize titles
const sanitizeTitle = (title) => {
  if (!title) return "";
  return title
    .replace(/(&nbsp;|\u00A0)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

document.getElementById("export-toggle").addEventListener("click", () => {
  const menu = document.getElementById("export-menu");
  menu.classList.toggle("hidden");
});

// Helper function to set active note and update UI
function setActiveNote(noteId) {
  currentNoteId = noteId;
  // Update visual state in sidebar
  document.querySelectorAll(".page-list li").forEach((item) => {
    if (item.getAttribute("data-note-id") === noteId) {
      item.classList.add("bg-gray-200");
    } else {
      item.classList.remove("bg-gray-200");
    }
  });
}

// Initialize Editor.js with given data; if creating a new page, use an empty header block
const initializeEditor = (data = {}, isNewPage = false) => {
  if (editor) {
    editor.destroy();
  }

  let initialBlocks;

  if (isNewPage) {
    initialBlocks = [
      {
        type: "header",
        data: { text: "", level: 1 },
      },
    ];
  } else {
    initialBlocks =
      data.blocks && data.blocks.length > 0
        ? data.blocks
        : [
            {
              type: "header",
              data: { text: "", level: 1 },
            },
          ];
  }

  editor = new EditorJS({
    holder: "editorjs",
    autofocus: false,
    onChange: () => {
      // Update title in real-time and auto-save the note
      handleTitleChange();
    },
    tools: {
      header: {
        class: Header,
        inlineToolbar: true,
        config: {
          placeholder: "New page",
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 1,
        },
      },

      list: {
        class: List,
        inlineToolbar: true,
      },
      toggle: {
        class: ToggleBlock,
        inlineToolbar: true,
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: "Enter a quote",
          captionPlaceholder: "Quote's author",
        },
      },
      image: {
        class: ImageTool,
        config: {
          endpoints: {
            byFile: "http://localhost:5002/uploadFile", // File upload endpoint
            byUrl: "http://localhost:5002/fetchUrl", // Fetch image by URL
          },
        },
      },
      table: {
        class: Table,
        inlineToolbar: true,
      },

      delimiter: {
        class: Delimiter,
        config: {
          styleOptions: ["star", "dash", "line"],
          defaultStyle: "star",
          lineWidthOptions: [8, 15, 25, 35, 50, 60, 100],
          defaultLineWidth: 25,
          lineThicknessOptions: [1, 2, 3, 4, 5, 6],
          defaultLineThickness: 2,
        },
      },
      warning: {
        class: Warning,
        inlineToolbar: true,
        config: {
          titlePlaceholder: "Title",
          messagePlaceholder: "Message",
        },
      },
      alert: {
        class: Alert,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+A",
        config: {
          alertTypes: [
            "primary",
            "secondary",
            "info",
            "success",
            "warning",
            "danger",
            "light",
            "dark",
          ],
          defaultType: "primary",
          messagePlaceholder: "Enter something",
        },
      },
      ColorPicker: {
        class: ColorPicker,
      },
      code: {
        class: CodeTool,
        config: {
          modes: {
            js: "JavaScript",
            py: "Python",
            go: "Go",
            cpp: "C++",
            cs: "C#",
            md: "Markdown",
          },
          defaultMode: "go",
        },
      },
      inlineCode: {
        class: InlineCode,
        shortcut: "CTRL+E",
      },
      linkTool: {
        class: LinkTool,
        config: {
          endpoint: "http://localhost:5002/fetchUrl", // Your backend endpoint for url data fetching,
          onFetchError: (error) => {
            console.error("Failed to fetch link preview:", error);
          },
        },
      },
      embed: {
        class: Embed,
        inlineToolbar: true,
        config: {
          services: {
            youtube: true,
            coub: true,
            facebook: true,
            instagram: true,
            reddit: true,
          },
        },
      },
      attaches: {
        class: AttachesTool,
        config: {
          endpoint: "http://localhost:5002/uploadFile",
        },
      },
      Marker: {
        class: Marker,
        shortcut: "CTRL+SHIFT+H",
      },
      strikethrough: Strikethrough,
      textVariant: TextVariantTune,
    },

    tunes: ["textVariant"],

    data: { blocks: initialBlocks },

    onReady: () => {
      if (!isNewPage) {
        // Remove extra empty block if note has content.
        const hasContent =
          data.blocks &&
          data.blocks.some((block) => {
            if (block.type === "header") {
              return block.data.text && block.data.text.trim() !== "";
            } else if (block.type === "list") {
              return block.data.items && block.data.items.length > 0;
            }
            return true;
          });

        if (hasContent) {
          const editorContainer = document.getElementById("editorjs");
          const emptyBlock = editorContainer.querySelector(
            ".codex-editor--empty"
          );
          if (emptyBlock) {
            emptyBlock.style.display = "none";
          }
        }
      } else {
        // When creating a new page, focus the first block and update the title.
        const firstBlock = editor.blocks.getBlockByIndex(0);
        if (firstBlock) {
          editor.caret.setToBlock(0, "start");
        }
        updatePageTitles("New page");
      }

      //Drag and drop blocks
      new DragDrop(editor, "2px solid #fff");

      //Undo
      new Undo({ editor });
    },
  });
};
window.editorInstance = editor; // This makes the editor globally accessible

// When the title changes, update the UI and auto-save the note
const handleTitleChange = async () => {
  try {
    const data = await editor.save();
    if (!data.blocks || !data.blocks.length) return;
    const titleBlock = data.blocks.find((block) => block.type === "header");
    if (titleBlock) {
      const rawTitle = titleBlock.data.text || "";
      const sanitizedTitle = sanitizeTitle(rawTitle);
      const displayTitle = sanitizedTitle === "" ? "New page" : sanitizedTitle;
      updatePageTitles(displayTitle);
      // Auto-save the note to the backend
      saveNoteToBackend();
    }
  } catch (error) {
    console.error("Error handling title change:", error);
  }
};

// Update the title in the header and in the sidebar for the current note
const updatePageTitles = (displayTitle) => {
  const noteTitleElem = document.getElementById("note-title");
  if (noteTitleElem) {
    noteTitleElem.textContent = displayTitle;
    noteTitleElem.setAttribute("title", displayTitle);
  }
  // Update the page name inside the sidebar list item
  const noteElem = document.querySelector(`[data-note-id="${currentNoteId}"]`);
  if (noteElem) {
    const pageNameElem = noteElem.querySelector(".page-name");
    if (pageNameElem) {
      pageNameElem.textContent = displayTitle;
    }
  }
};

// Fetch all notes for the authenticated user from the backend
async function loadNotesFromBackend() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No authentication token found! Redirecting to login.");
    window.location.href = "/login.html";
    return;
  }
  try {
    const res = await fetch("http://localhost:5002/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notesData = await res.json();
    if (res.status === 401) {
      console.error("Unauthorized! Token might be invalid.");
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }
    console.log("User notes from backend:", notesData);
    if (!Array.isArray(notesData)) {
      console.error("Invalid data format received:", notesData);
      return;
    }
    notes = notesData;
    renderNotesSidebar();

    // If there are notes, load the first one; otherwise, create a new page in "private".
    if (notes.length > 0) {
      loadNote(notes[0]._id);
    } else {
      createNewPage("private");
    }
  } catch (err) {
    console.error("Error loading notes:", err);
  }
}

// Render the sidebar list grouped by category
function renderNotesSidebar() {
  // Clear each category's page list
  document.querySelectorAll(".notes-category").forEach((categoryElem) => {
    const ul = categoryElem.querySelector(".page-list");
    if (ul) {
      ul.innerHTML = "";
    }
  });

  // Iterate over notes and append them to the correct category list.
  notes.forEach((note) => {
    // Default to "private" if no category exists.
    const noteCategory = note.category || "private";
    const categoryElem = document.querySelector(
      `.notes-category[data-category="${noteCategory}"]`
    );
    if (!categoryElem) return;

    const ul = categoryElem.querySelector(".page-list");
    if (!ul) return;

    let displayTitle = "New page";
    if (note.data && note.data.blocks && note.data.blocks.length > 0) {
      const headerBlock = note.data.blocks.find(
        (block) => block.type === "header"
      );
      if (headerBlock && headerBlock.data && headerBlock.data.text) {
        displayTitle = sanitizeTitle(headerBlock.data.text) || "New page";
      }
    }

    const li = document.createElement("li");
    li.setAttribute("data-note-id", note._id);
    li.classList.add(
      "cursor-pointer",
      "flex",
      "items-center",
      "px-2",
      "py-2",
      "rounded-md",
      "text-gray-500",
      "font-medium",
      "hover:bg-gray-300",
      "transition-all",
      "gap-2"
    );

    // Highlight the active //
    if (note._id === currentNoteId) {
      li.classList.add("bg-gray-200");
    }

    li.onclick = () => {
      // First switch to editor view before loading the note
      const editorView = "editor-view";
      switchToView(editorView);

      // Then load the note
      loadNote(note._id);
    };

    li.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showContextMenu(event, note._id);
    });

    li.innerHTML = `
      <svg class="flex-shrink-0 w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
      </svg>
      <span class="page-name truncate" title="${displayTitle}">${displayTitle}</span>
    `;
    ul.appendChild(li);
  });
}

// Function to switch to a specific view - imported from viewManager.js
function switchToView(viewId) {
  // Get all views
  const views = document.querySelectorAll(".view-content");

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
  const noteTitle = document.getElementById("note-title");
  if (viewId === "editor-view") {
    if (noteTitle) {
      noteTitle.style.display = "block";
    }
  } else {
    if (noteTitle) {
      noteTitle.style.display = "none";
    }
  }

  // Remove active state from all tabs
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => tab.classList.remove("bg-gray-200"));
}

// Show a dynamic context menu with a "Delete" option styled like Notion's
function showContextMenu(event, noteId) {
  let existingMenu = document.getElementById("context-menu");
  if (existingMenu) {
    existingMenu.remove();
  }
  const menu = document.createElement("div");
  menu.id = "context-menu";
  menu.style.position = "absolute";
  menu.style.top = event.pageY + "px";
  menu.style.left = event.pageX + "px";
  menu.style.backgroundColor = "white";
  menu.style.width = "120px";
  menu.style.borderRadius = "8px";
  menu.style.border = "1px solid #ccc";
  menu.style.padding = "10px 12px";
  menu.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  menu.style.cursor = "pointer";
  menu.style.transition = "color 0.2s ease";
  menu.style.color = "inherit";
  menu.textContent = "Delete";
  menu.style.zIndex = "1";

  menu.addEventListener("mouseover", () => {
    menu.style.color = "red";
  });
  menu.addEventListener("mouseout", () => {
    menu.style.color = "inherit";
  });
  menu.addEventListener("click", () => {
    deleteNote(noteId);
    menu.remove();
  });
  document.body.appendChild(menu);

  document.addEventListener("click", function removeMenu(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", removeMenu);
    }
  });
}

// Load a specific note into the editor by its ID
function loadNote(noteId) {
  const note = notes.find((n) => n._id === noteId);
  if (!note) {
    console.error(`Note not found: ${noteId}`);
    return;
  }

  // Set active note status - use our new helper function
  setActiveNote(noteId);

  // Make sure we're in editor view
  switchToView("editor-view");

  let displayTitle = "New page";
  if (note.data && note.data.blocks && note.data.blocks.length > 0) {
    const headerBlock = note.data.blocks.find(
      (block) => block.type === "header"
    );
    if (headerBlock && headerBlock.data && headerBlock.data.text) {
      displayTitle = sanitizeTitle(headerBlock.data.text) || "New page";
    }
  }
  updatePageTitles(displayTitle);
  initializeEditor(note.data);
}

// Create a new note on the backend and add it to the sidebar. Accepts a category parameter.
async function createNewPage(category = "private") {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to create a new page!");
    window.location.href = "/login.html";
    return;
  }
  const newNoteData = {
    blocks: [
      {
        type: "header",
        data: { text: "", level: 1 },
      },
    ],
    category: category,
  };
  try {
    const res = await fetch("http://localhost:5002/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: newNoteData }),
    });
    const newNote = await res.json();
    if (res.status === 401) {
      alert("Unauthorized! Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }
    if (!newNote._id) {
      console.error("Invalid response when creating a note:", newNote);
      return;
    }
    newNote.category = category; // Tag the new note with its category

    // Make sure we're in editor view
    switchToView("editor-view");

    // Set this as active note using our helper function
    setActiveNote(newNote._id);

    notes.push(newNote);
    renderNotesSidebar();
    initializeEditor(newNote.data, true);
  } catch (err) {
    console.error("Error creating new note:", err);
  }
}

// Delete a note both from the backend and update the sidebar
async function deleteNote(noteId) {
  const token = localStorage.getItem("token");
  // if (!confirm("Are you sure you want to delete this note?")) return;
  try {
    const res = await fetch(`http://localhost:5002/api/notes/${noteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error("Failed to delete note");
      return;
    }
    notes = notes.filter((n) => n._id !== noteId);

    // If we deleted the currently active note, load another one
    if (currentNoteId === noteId) {
      if (notes.length > 0) {
        loadNote(notes[0]._id);
      } else {
        currentNoteId = null;
        initializeEditor({}, true);
      }
    }

    renderNotesSidebar();
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

// Save the current note (update it) on the backend
async function saveNoteToBackend() {
  const token = localStorage.getItem("token");
  try {
    const outputData = await editor.save();

    // Find the current note's category or default to "private"
    let currentCategory = "private";
    const currentNote = notes.find((n) => n._id === currentNoteId);
    if (currentNote && currentNote.category) {
      currentCategory = currentNote.category;
    }

    let res;
    if (currentNoteId) {
      res = await fetch(`http://localhost:5002/api/notes/${currentNoteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: outputData, category: currentCategory }),
      });
    } else {
      res = await fetch("http://localhost:5002/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: outputData, category: currentCategory }),
      });
    }
    const savedNote = await res.json();
    console.log("Note saved:", savedNote);
    if (!currentNoteId) {
      // If this is a new note, set it as active
      setActiveNote(savedNote._id);
      notes.push(savedNote);
    } else {
      const index = notes.findIndex((n) => n._id === currentNoteId);
      if (index !== -1) {
        notes[index] = savedNote;
      }
    }
    renderNotesSidebar();
  } catch (err) {
    console.error("Error saving note:", err);
  }
}

// Initialize the application once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listeners to all plus buttons in each category
  document.querySelectorAll(".new-page-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Determine the category from the closest .notes-category container
      const category =
        btn.closest(".notes-category").getAttribute("data-category") ||
        "private";
      createNewPage(category);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveNoteToBackend();
    }
  });
  loadNotesFromBackend();
});

// Fetch username from the backend when page loads
document.addEventListener("DOMContentLoaded", async () => {
  const usernameDisplay = document.getElementById("username-display");
  const popupUsername = document.getElementById("popup-username");
  const settingsUsername = document.getElementById("settings-username");
  const settingsEmail = document.getElementById("settings-email");
  const popupEmail = document.getElementById("popup-email");

  const token = localStorage.getItem("token");
  if (!token) {
    usernameDisplay.textContent = "Guest";
    popupUsername.textContent = "Guest";
    settingsUsername.textContent = "Guest";
    settingsEmail.textContent = "guest@example.com";
    popupEmail.textContent = "guest@example.com";
    return;
  }
  try {
    const res = await fetch("http://localhost:5002/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (res.ok) {
      usernameDisplay.textContent = `${data.username}`;
      popupUsername.textContent = `${data.username}`;
      popupEmail.textContent = `${data.email}`;
      settingsUsername.textContent = `${data.username}`;
      settingsEmail.textContent = `${data.email}`;
    } else {
      console.error("Error fetching user details:", data.message);
      usernameDisplay.textContent = "User";
      popupUsername.textContent = "User";
      popupEmail.textContent = "unknown@example.com";
      settingsUsername.textContent = "User";
      settingsEmail.textContent = "unknown@example.com";
    }
  } catch (error) {
    console.error("Error:", error);
    usernameDisplay.textContent = "User";
    popupUsername.textContent = "User";
    popupEmail.textContent = "unknown@example.com";
    settingsUsername.textContent = "User";
    settingsEmail.textContent = "unknown@example.com";
  }
});

// Check authentication before allowing access
async function checkAuthentication() {
  const token = localStorage.getItem("token");
  console.log("Checking authentication...");
  console.log("Token in localStorage:", token);
  if (!token) {
    console.log("No token found. Redirecting...");
    window.location.href = "login.html";
    return;
  }
  try {
    const res = await fetch("http://localhost:5002/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Authentication response status:", res.status);
    if (!res.ok) {
      console.log("Invalid token. Removing from localStorage...");
      localStorage.removeItem("token");
      setTimeout(() => (window.location.href = "login.html"), 500);
      return;
    }
    const data = await res.json();
    console.log("User data received:", data);
    document.getElementById(
      "username-display"
    ).textContent = `Welcome, ${data.username}!`;
  } catch (error) {
    console.error("Authentication check failed:", error);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}
checkAuthentication();
