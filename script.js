// ---------- SELECT ELEMENTS ----------
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
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ---------- FUNCTION: SAVE TO LOCALSTORAGE ----------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---------- FUNCTION: RENDER TASKS ----------
function renderTasks() {
  taskList.innerHTML = "";
  
  // Update filter-person options
  const persons = [...new Set(tasks.map(t => t.person).filter(p => p))];
  filterPerson.innerHTML = `<option value="All">Filter: All Persons</option>` + 
    persons.map(p => `<option value="${p}">${p}</option>`).join("");

  // Apply filters
  let filteredTasks = [...tasks];
  if(filterPriority.value !== "All") {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority.value);
  }
  if(filterPerson.value !== "All") {
    filteredTasks = filteredTasks.filter(t => t.person === filterPerson.value);
  }

  // Apply sorting
  if(sortTasks.value === "date") {
    filteredTasks.sort((a,b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  } else if(sortTasks.value === "priority") {
    const priorityOrder = {High:1, Medium:2, Low:3};
    filteredTasks.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("task-item");

    const mainDiv = document.createElement("div");
    mainDiv.classList.add("task-main");

    const spanText = document.createElement("span");
    spanText.classList.add("task-text");
    if(task.completed) spanText.classList.add("completed");
    spanText.textContent = task.text;

    spanText.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const spanPerson = document.createElement("span");
    spanPerson.classList.add("task-person");
    if(task.person) spanPerson.textContent = `👤 ${task.person}`;

    const spanDatetime = document.createElement("span");
    spanDatetime.classList.add("task-datetime");
    if(task.date || task.time) spanDatetime.textContent = `📅 ${task.date || "--"} ⏰ ${task.time || "--"}`;

    const spanPriority = document.createElement("span");
    spanPriority.classList.add("task-priority", task.priority.toLowerCase());
    spanPriority.textContent = task.priority;

    mainDiv.append(spanText, spanPerson, spanDatetime, spanPriority);

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

  // Update counter
  const remaining = tasks.filter(t => !t.completed).length;
  tasksRemaining.textContent = remaining;
}

// ---------- ADD TASK EVENT ----------
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if(!text) return alert("Please enter a task!");

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

  // Clear input fields
  taskInput.value = "";
  taskDate.value = "";
  taskTime.value = "";
  taskPerson.value = "";
  taskPriority.value = "Medium";
});

// Enter key support
taskInput.addEventListener("keypress", e => {
  if(e.key === "Enter") addBtn.click();
});

// Filter/Sort events
[filterPriority, filterPerson, sortTasks].forEach(el => {
  el.addEventListener("change", renderTasks);
});

// ---------- REMINDERS ----------
if(Notification.permission !== "granted") {
  Notification.requestPermission();
}

function checkReminders() {
  const now = new Date();
  tasks.forEach(task => {
    if(!task.completed && task.date && task.time){
      const taskTime = new Date(`${task.date}T${task.time}`);
      const diff = taskTime - now;
      if(diff > 0 && diff < 60000){
        new Notification(`Reminder: "${task.text}" is due now!`);
      }
    }
  });
}

// Check reminders every 30 seconds
setInterval(checkReminders, 30000);

// ---------- INITIAL RENDER ----------
renderTasks();
