import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("task-modal");
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const dateInput = document.getElementById("task-date");
  const timeInput = document.getElementById("task-time");
  const reminderInput = document.getElementById("task-reminder");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const deleteBtn = document.getElementById("delete-task-btn");
  const modalTitle = document.getElementById("modal-title");

  let activeEvent = null; // holds event when editing

  function openModal(eventInfo = null, dateStr = null) {
    activeEvent = eventInfo;
    if (eventInfo) {
      // Editing existing
      modalTitle.textContent = "Edit Task";
      titleInput.value = eventInfo.event.title;
      descInput.value = eventInfo.event.extendedProps.description || "";
      const start = eventInfo.event.start;
      dateInput.value = start.toISOString().slice(0, 10);
      timeInput.value = start.toTimeString().slice(0, 5);
      reminderInput.checked = !!eventInfo.event.extendedProps.reminder;
      deleteBtn.classList.remove("hidden");
    } else {
      // Creating new
      modalTitle.textContent = "New Task";
      form.reset();
      dateInput.value = dateStr;
      deleteBtn.classList.add("hidden");
    }
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    activeEvent = null;
  }

  cancelBtn.addEventListener("click", closeModal);

  deleteBtn.addEventListener("click", async () => {
    if (activeEvent) {
      const id = activeEvent.event.id;
      await fetch(`http://localhost:5002/api/tasks/${id}`, {
        method: "DELETE",
      });
      activeEvent.event.remove();
      closeModal();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const reminder = reminderInput.checked;

    // Combine date & time
    const start = time ? `${date}T${time}` : date;

    const payload = { title, start, description: desc, reminder };

    if (activeEvent) {
      // UPDATE
      const id = activeEvent.event.id;
      await fetch(`http://localhost:5002/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      activeEvent.event.setProp("title", title);
      activeEvent.event.setExtendedProp("description", desc);
      activeEvent.event.setExtendedProp("reminder", reminder);
      activeEvent.event.setStart(start);
    } else {
      // CREATE
      const res = await fetch("http://localhost:5002/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newTask = await res.json();
      calendar.addEvent({
        id: newTask._id,
        title,
        start,
        extendedProps: { description: desc, reminder },
      });
    }

    closeModal();
  });

  const calendarEl = document.getElementById("calendar");
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,listWeek",
    },
    events: "http://localhost:5002/api/tasks",
    dateClick: (info) => openModal(null, info.dateStr),
    eventClick: (info) => openModal(info),
  });

  calendar.render();
  window.fullCalendarInstance = calendar;
});
