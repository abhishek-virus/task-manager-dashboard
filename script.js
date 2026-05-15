/* =====================================
   GLOBAL STATE
===================================== */

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedIndex = null;
let sortMode = "default";
let editingTaskId = null;

/* =====================================
   LOCAL STORAGE
===================================== */

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


/* =====================================
   TASK CRUD OPERATIONS
===================================== */

function addTask() {
  let title = document.getElementById("title").value;
  let description = document.getElementById("description").value;
  let priority = document.getElementById("priority").value;
  let date = document.getElementById("date").value;

  if (!title) return;

  let editingTask = tasks.find(t => t.editing);

  if (editingTask) {
    editingTask.title = title;
    editingTask.description = description;
    editingTask.priority = priority;
    editingTask.date = date;
    delete editingTask.editing;
  } else {
    tasks.unshift({
      id: Date.now(),
      title,
      description,
      priority,
      date,
      completed: false
    });
  }

  clearInputs();
  saveTasks();
  renderTasks();
}


function editTask(id) {

  let task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;

  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description || "";
  document.getElementById("editPriority").value = task.priority;
  document.getElementById("editDate").value = task.date;

  document.getElementById("editModal").style.display = "flex";
}

function updateTask() {

  let task = tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  task.title = document.getElementById("editTitle").value;
  task.description = document.getElementById("editDescription").value;
  task.priority = document.getElementById("editPriority").value;
  task.date = document.getElementById("editDate").value;

  saveTasks();
  renderTasks();

  document.getElementById("editModal").style.display = "none";
}


function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  renderTasks();
}


function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}


function clearEditing() {
  tasks.forEach(task => delete task.editing);
}


/* =====================================
   SORTING
===================================== */

function sortByPriority() {
  sortMode = "priority";
  renderTasks();
}


/* =====================================
   DRAG & DROP SUPPORT
===================================== */

function handleDragStart(index) {
  draggedIndex = index;
}


function handleDrop(index) {
  if (draggedIndex === null) return;

  let draggedTask = tasks[draggedIndex];

  tasks.splice(draggedIndex, 1);
  tasks.splice(index, 0, draggedTask);

  saveTasks();
  renderTasks();

  draggedIndex = null;
}


/* =====================================
   DARK MODE TOGGLE
===================================== */

function toggleDarkMode() {

  document.body.classList.toggle("dark");

  const modeButton = document.querySelector(".toggle-mode-btn");

  if (document.body.classList.contains("dark")) {
    modeButton.innerText = "☀️ Light Mode";
  } else {
    modeButton.innerText = "🌙 Dark Mode";
  }

}


/* =====================================
   INPUT HELPERS
===================================== */

function expandDescription() {
  const descBox = document.getElementById("description");

  if (!descBox.value) {
    descBox.style.height = "200px";
  }
}


function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}


function clearInputs() {
  const descBox = document.getElementById("description");

  document.getElementById("title").value = "";
  descBox.value = "";
  document.getElementById("date").value = "";

  descBox.style.height = "38px";
}


/* =====================================
   MAIN RENDER ENGINE
===================================== */

function renderTasks() {

  let search = document
    .getElementById("search")
    .value
    .toLowerCase();

  let filteredTasks = tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) =>
      task.title.toLowerCase().includes(search)
    );


  if (sortMode === "priority") {

    filteredTasks.sort((a, b) => {

      const order = {
        High: 1,
        Medium: 2,
        Low: 3
      };

      return order[a.task.priority] - order[b.task.priority];

    });

  }


  let completedCount = tasks.filter(t => t.completed).length;

  let progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;


  let today = new Date().toISOString().split("T")[0];

  let html = "";


  filteredTasks.forEach(({ task, index }) => {

    let overdue =
      task.date &&
      task.date < today &&
      !task.completed;

    html += `
<div class="card"
draggable="true"
ondragstart="handleDragStart(${index})"
ondragover="event.preventDefault()"
ondrop="handleDrop(${index})"
style="border-left: 6px solid ${overdue ? 'red' : '#4CAF50'}">

<h3 class="${task.completed ? "completed" : ""}">
${task.title}
</h3>

<p class="task-desc">${task.description || ""}</p>

<p>Due: ${task.date || "Not set"}</p>

<p class="${task.priority.toLowerCase()}">
Priority: ${task.priority}
</p>

<input type="checkbox"
${task.completed ? "checked" : ""}
onclick="toggleTask(${task.id})">

<br>

<button class="edit"
onclick="editTask(${task.id})">
Edit
</button>

<button class="delete"
onclick="deleteTask(${task.id})">
Delete
</button>

</div>
`;

  });


  document.getElementById("taskList").innerHTML = html;

  document.getElementById("progressBar").style.width =
    progress + "%";

}


/* =====================================
   INITIAL LOAD
===================================== */

renderTasks();