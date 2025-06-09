document.addEventListener("DOMContentLoaded", () => {
  // Ensure editorInstance is available
  const editor = window.editorInstance;

  if (!editor) {
    console.error("Editor instance not found!");
    return; // Exit if editor instance is not found
  }

  // Toggle dropdown visibility
  const exportToggleButton = document.getElementById("export-toggle");
  if (exportToggleButton) {
    exportToggleButton.addEventListener("click", () => {
      const menu = document.getElementById("export-menu");
      if (menu) {
        menu.classList.toggle("hidden");
      }
    });
  }

  // Event listener for the "Export as PDF" button
  const exportPdfButton = document.getElementById("export-pdf");
  if (exportPdfButton) {
    exportPdfButton.addEventListener("click", () => {
      exportNoteAs("pdf");
    });
  }

  // Event listener for the "Export as Markdown" button
  const exportMdButton = document.getElementById("export-md");
  if (exportMdButton) {
    exportMdButton.addEventListener("click", () => {
      exportNoteAs("md");
    });
  }

  // Event listener for the "Export as TXT" button
  const exportTxtButton = document.getElementById("export-txt");
  if (exportTxtButton) {
    exportTxtButton.addEventListener("click", () => {
      exportNoteAs("txt");
    });
  }
});

// Function to export note
function exportNoteAs(format) {
  const editor = window.editorInstance; // Accessing the globally available editor instance

  if (editor) {
    // Assuming exportNote is a function that handles export logic
    exportNote(editor, format);
  } else {
    console.error("Editor instance not found!");
  }
}
