console.log("🔍 searchNotes.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  console.log("🧪 search input:", input);
  console.log("🧪 results container:", results);

  if (!input || !results) {
    console.warn("🚫 search input or results container not found.");
    return;
  }

  input.addEventListener("input", async () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = "";

    if (!q) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5002/api/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch notes");
      }

      const notes = await res.json();

      if (!Array.isArray(notes)) {
        throw new Error("Invalid notes format from server");
      }

      const filtered = notes.filter((note) => {
        const headerBlock = note.data?.blocks?.find((b) => b.type === "header");
        const paragraphBlock = note.data?.blocks?.find(
          (b) => b.type === "paragraph"
        );

        const title = note.title || headerBlock?.data?.text || "";
        const content = paragraphBlock?.data?.text || "";

        return (
          title.toLowerCase().includes(q) || content.toLowerCase().includes(q)
        );
      });

      if (filtered.length === 0) {
        results.innerHTML = `<p class="text-gray-500">No matching notes.</p>`;
        return;
      }

      filtered.forEach((note) => {
        let title = note.title;
        if (!title && note.data?.blocks?.length > 0) {
          const header = note.data.blocks.find((b) => b.type === "header");
          const paragraph = note.data.blocks.find(
            (b) => b.type === "paragraph"
          );
          title =
            header?.data?.text || paragraph?.data?.text || "Untitled Note";
        }

        const div = document.createElement("div");
        div.className =
          "p-2 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer";
        div.textContent = title;

        div.addEventListener("click", () => {
          console.log("📝 Opening note:", note);
          openNote(note);
        });

        results.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Error fetching notes:", err);
      results.innerHTML = `<p class="text-red-500">Could not load notes.</p>`;
    }
  });
});

function openNote(note) {
  window.currentNote = note;
  window.currentNoteId = note._id;

  // Switch view FIRST
  switchToView("editor-view");

  // Then wait for the DOM to update before rendering the note
  setTimeout(() => {
    renderEditorWithNote(note);
  }, 50); // Small delay so DOM has time to load
}

function renderEditorWithNote(note) {
  const titleEl = document.getElementById("note-title");
  const bodyEl = document.getElementById("note-body");

  if (!titleEl || !bodyEl) {
    console.warn("⚠️ note-title or note-body element not found in DOM");
    return;
  }

  const header = note.data?.blocks?.find((b) => b.type === "header");
  const paragraph = note.data?.blocks?.find((b) => b.type === "paragraph");

  titleEl.textContent = header?.data?.text || "Untitled";
  bodyEl.textContent = paragraph?.data?.text || "No content available.";
}
