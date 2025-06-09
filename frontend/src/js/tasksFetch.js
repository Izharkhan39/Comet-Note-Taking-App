function getCompletedTasks() {
  return JSON.parse(localStorage.getItem("completedTasks") || "[]");
}

function markTaskCompleted(id) {
  const completed = getCompletedTasks();
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem("completedTasks", JSON.stringify(completed));
  }
}

function unmarkTaskCompleted(id) {
  const completed = getCompletedTasks().filter((taskId) => taskId !== id);
  localStorage.setItem("completedTasks", JSON.stringify(completed));
}

async function loadTaskList() {
  const container = document.querySelector("#tasks-view .tasks-container");
  container.innerHTML = ""; // clear

  const res = await fetch("http://localhost:5002/api/tasks");
  const tasks = await res.json();

  const completedTasks = getCompletedTasks();

  if (tasks.length === 0) {
    container.innerHTML = `<p class="text-gray-600">No tasks yet.</p>`;
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className =
      "flex justify-between items-start bg-gray-100 dark:bg-gray-700 p-3 rounded relative group";

    const left = document.createElement("div");
    left.className = "flex items-start space-x-3";

    const btn = document.createElement("button");
    btn.className =
      "mt-1 text-gray-400 hover:text-green-500 focus:outline-none";
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
      </svg>`;

    const info = document.createElement("div");

    const title = document.createElement("div");
    title.className = "task-title text-gray-800 dark:text-gray-200 font-medium";
    title.textContent = task.title;

    // Apply strikethrough if in completedTasks
    if (completedTasks.includes(task.id)) {
      title.classList.add("line-through", "text-gray-400");

      // Optional: also remove from calendar
      const fcEvent = window.fullCalendarInstance?.getEventById(task.id);
      if (fcEvent) fcEvent.remove();
    }

    const desc = document.createElement("div");
    desc.className = "text-sm text-gray-600 dark:text-gray-400";
    desc.textContent = task.desc || "";

    const datetime = document.createElement("div");
    datetime.className = "text-xs text-gray-500 dark:text-gray-400 mt-1";
    const date = new Date(task.start);
    datetime.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;

    info.append(title, desc, datetime);
    left.append(btn, info);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 hover:text-red-500" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M6 18L18 6M6 6l12 12" />
      </svg>`;
    deleteBtn.className = "absolute top-2 right-2";

    // Check button logic
    btn.addEventListener("click", () => {
      const checked = title.classList.toggle("line-through");
      title.classList.toggle("text-gray-400");

      if (checked) {
        markTaskCompleted(task.id);
        const fcEvent = window.fullCalendarInstance?.getEventById(task.id);
        if (fcEvent) fcEvent.remove();
      } else {
        unmarkTaskCompleted(task.id);
      }
    });

    // Delete logic
    deleteBtn.addEventListener("click", async () => {
      await fetch(`http://localhost:5002/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const fcEvent = window.fullCalendarInstance?.getEventById(task.id);
      if (fcEvent) fcEvent.remove();

      item.remove();
      unmarkTaskCompleted(task.id);
    });

    item.append(left, deleteBtn);
    container.appendChild(item);
  });
}

// Override switchToView only once
window.addEventListener("DOMContentLoaded", () => {
  const originalSwitch = window.switchToView;

  window.switchToView = function (viewId) {
    originalSwitch(viewId);
    if (viewId === "tasks-view") {
      console.log("✅ Tasks view activated");
      loadTaskList();
    }
  };
});
