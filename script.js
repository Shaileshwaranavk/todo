// ---------- SELECT ELEMENTS ----------
// Grab DOM elements for task input, date/time, person, priority, and buttons
const taskInput = document.getElementById("task-input");
const taskDate = document.getElementById("task-date");
const taskTime = document.getElementById("task-time");
const taskPerson = document.getElementById("task-person");
const taskPriority = document.getElementById("task-priority");
const addBtn = document.getElementById("add-btn");

const taskList = document.getElementById("task-list");
const tasksRemaining = document.getElementById("tasks-remaining");

const filterPriority = document.getElementById("filter-priority");
const filterPerson = document.getElementById("filter-person");
const sortTasks = document.getElementById("sort-tasks");

// ---------- INITIALIZE TASKS ----------
// Load tasks from localStorage, or start with an empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ---------- FUNCTION: SAVE TO LOCALSTORAGE ----------
// Persist tasks array as JSON string in localStorage for browser persistence
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---------- FUNCTION: RENDER TASKS ----------
// Re-draw the task list whenever tasks change or filters/sorting are applied
function renderTasks() {
  taskList.innerHTML = "";
  
  // Dynamically update person filter options based on current tasks
  const persons = [...new Set(tasks.map(t => t.person).filter(p => p))];
  filterPerson.innerHTML = `<option value="All">Filter: All Persons</option>` + 
    persons.map(p => `<option value="${p}">${p}</option>`).join("");

  // ---------- FILTER TASKS ----------
  let filteredTasks = [...tasks];
  if(filterPriority.value !== "All") {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority.value);
  }
  if(filterPerson.value !== "All") {
    filteredTasks = filteredTasks.filter(t => t.person === filterPerson.value);
  }

  // ---------- SORT TASKS ----------
  if(sortTasks.value === "date") {
    // Sort tasks chronologically by combining date and time fields
    filteredTasks.sort((a,b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  } else if(sortTasks.value === "priority") {
    // Sort by priority: High -> Medium -> Low
    const priorityOrder = {High:1, Medium:2, Low:3};
    filteredTasks.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  // ---------- CREATE TASK ELEMENTS ----------
  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("task-item");

    const mainDiv = document.createElement("div");
    mainDiv.classList.add("task-main");

    // Task text with click toggle for completion
    const spanText = document.createElement("span");
    spanText.classList.add("task-text");
    if(task.completed) spanText.classList.add("completed");
    spanText.textContent = task.text;

    // Toggle completed state and re-render when clicked
    spanText.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // Display assigned person if available
    const spanPerson = document.createElement("span");
    spanPerson.classList.add("task-person");
    if(task.person) spanPerson.textContent = `👤 ${task.person}`;

    // Display task date and time if available
    const spanDatetime = document.createElement("span");
    spanDatetime.classList.add("task-datetime");
    if(task.date || task.time) spanDatetime.textContent = `📅 ${task.date || "--"} ⏰ ${task.time || "--"}`;

    // Display task priority with color-coded class
    const spanPriority = document.createElement("span");
    spanPriority.classList.add("task-priority", task.priority.toLowerCase());
    spanPriority.textContent = task.priority;

    mainDiv.append(spanText, spanPerson, spanDatetime, spanPriority);

    // Delete button removes task from array and updates storage
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(tasks.indexOf(task),1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(mainDiv);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  // Update counter showing remaining incomplete tasks
  const remaining = tasks.filter(t => !t.completed).length;
  tasksRemaining.textContent = remaining;
}

// ---------- ADD TASK EVENT ----------
// Handles adding a new task with all inputs
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if(!text) return alert("Please enter a task!"); // Prevent empty tasks

  tasks.push({
    text,
    completed: false,
    date: taskDate.value,
    time: taskTime.value,
    person: taskPerson.value.trim(),
    priority: taskPriority.value
  });

  saveTasks();
  renderTasks();

  // Clear input fields for next entry
  taskInput.value = "";
  taskDate.value = "";
  taskTime.value = "";
  taskPerson.value = "";
  taskPriority.value = "Medium";
});

// Support Enter key to add task
taskInput.addEventListener("keypress", e => {
  if(e.key === "Enter") addBtn.click();
});

// Filter and sort event listeners
[filterPriority, filterPerson, sortTasks].forEach(el => {
  el.addEventListener("change", renderTasks);
});

// ---------- REMINDERS ----------
// Request notification permission if not already granted
if(Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Notify user when a task is due within the next minute
function checkReminders() {
  const now = new Date();
  tasks.forEach(task => {
    if(!task.completed && task.date && task.time){
      const taskTime = new Date(`${task.date}T${task.time}`);
      const diff = taskTime - now;
      if(diff > 0 && diff < 60000){ // less than 1 minute
        new Notification(`Reminder: "${task.text}" is due now!`);
      }
    }
  });
}

// Run reminder check every 30 seconds
setInterval(checkReminders, 30000);

// ---------- INITIAL RENDER ----------
// Draw tasks immediately on page load
renderTasks();
