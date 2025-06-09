import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import CodeTool from "@rxpm/editor-js-code";
import Paragraph from "@editorjs/paragraph";
import UndoPlugin from "editorjs-undo";
import Delimiter from "@coolbytes/editorjs-delimiter";

import Warning from "@editorjs/warning";
import Alert from "editorjs-alert";
import ToggleBlock from "editorjs-toggle-block";
import ColorPicker from "editorjs-color-picker";
import InlineCode from "@editorjs/inline-code";
import DragDrop from "editorjs-drag-drop";
import LinkTool from "@editorjs/link";

import { exportNote } from "./export.js"; // ✅ Only this import needed for export

console.log("Editor.js is loading...");

const editor = new EditorJS({
  holder: "editorjs",

  tools: {
    header: {
      class: Header,
      inlineToolbar: true,
      config: {
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 1,
      },
    },
    list: {
      class: List,
      inlineToolbar: true,
      Unordered: "Bulleted list",
      config: {
        createBlockOnLineBreak: true,
        convertToBlockOnLineBreak: true,
      },
    },
    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: "http://localhost:5002/notes/upload",
          byUrl: "http://localhost:5002/fetchUrl",
        },
        field: "image",
      },
    },
    table: { class: Table, inlineToolbar: true },
    quote: {
      class: Quote,
      inlineToolbar: true,
      toolbox: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" ...</svg>',
        title: "Quote",
      },
      config: {
        quotePlaceholder: "Enter a quote",
        captionPlaceholder: "Quote's author",
      },
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
    toggle: { class: ToggleBlock, inlineToolbar: true },
    ColorPicker: { class: ColorPicker },
    inlineCode: { class: InlineCode, shortcut: "CTRL+E" },
    linkTool: {
      class: LinkTool,
      config: {
        endpoint: "http://localhost:5002/fetchUrl",
      },
    },
  },

  onReady: () => {
    console.log("Editor.js is ready!");
    new DragDrop(editor, "2px solid #fff");
  },
});

window.editorInstance = editor; // This makes the editor globally accessible

export default editor;

// ✅ Export function connected to global window
window.exportNoteAs = function (format) {
  exportNote(editor, format);
};

// ✅ Toggle dropdown for Share ▼ button
document.getElementById("export-toggle").addEventListener("click", () => {
  const menu = document.getElementById("export-menu");
  menu.classList.toggle("hidden");
});
