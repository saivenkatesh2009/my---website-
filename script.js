const modal = document.getElementById("taskModal");
const openTaskModal = document.getElementById("openTaskModal");
const openTaskModalSecond = document.getElementById("openTaskModalSecond");
const emptyTaskButton = document.getElementById("emptyTaskButton");
const closeModal = document.getElementById("closeModal");

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const completedTasks = document.getElementById("completedTasks");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progressPercentage = document.getElementById("progressPercentage");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const quoteBox = document.getElementById("quoteBox");

const subjectFilter = document.getElementById("subjectFilter");
const filterButtons = document.querySelectorAll(".filter-button");

const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

const scrollTimetableButton = document.getElementById("scrollTimetableButton");

const startTimer = document.getElementById("startTimer");
const resetTimer = document.getElementById("resetTimer");
const timer = document.getElementById("timer");

const greeting = document.getElementById("greeting");
const todayDate = document.getElementById("todayDate");
const year = document.getElementById("year");

let tasks = JSON.parse(localStorage.getItem("btechStudyFlowTasks")) || [
  {
    id: 1,
    name: "Solve 5 DSA array questions",
    subject: "DSA",
    priority: "High",
    date: getToday(),
    completed: false
  },
  {
    id: 2,
    name: "Complete HTML portfolio project",
    subject: "Programming",
    priority: "Medium",
    date: getToday(),
    completed: true
  },
  {
    id: 3,
    name: "Revise DBMS normalization notes",
    subject: "DBMS",
    priority: "High",
    date: getTomorrow(),
    completed: false
  },
  {
    id: 4,
    name: "Read Operating Systems process scheduling",
    subject: "Operating Systems",
    priority: "Low",
    date: getTomorrow(),
    completed: false
  }
];

let activeFilter = "all";

let timerSeconds = 25 * 60;
let timerInterval = null;
let isTimerRunning = false;

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function saveTasks() {
  localStorage.setItem("btechStudyFlowTasks", JSON.stringify(tasks));
}

function escapeHtml(text) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

function formatDate(date) {
  if (!date) {
    return "No deadline";
  }

  if (date === getToday()) {
    return "Due today";
  }

  if (date === getTomorrow()) {
    return "Due tomorrow";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

function priorityNumber(priority) {
  const order = {
    High: 1,
    Medium: 2,
    Low: 3
  };

  return order[priority] || 4;
}

function getVisibleTasks() {
  return tasks.filter((task) => {
    const statusMatch =
      activeFilter === "all" ||
      (activeFilter === "active" && !task.completed) ||
      (activeFilter === "completed" && task.completed);

    const subjectMatch =
      subjectFilter.value === "all" ||
      task.subject === subjectFilter.value;

    return statusMatch && subjectMatch;
  });
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";

  if (visibleTasks.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");

    visibleTasks
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        return priorityNumber(a.priority) - priorityNumber(b.priority);
      })
      .forEach((task) => {
        const item = document.createElement("article");

        item.className = "task-item";

        item.innerHTML = `
          <button class="check-task ${task.completed ? "checked" : ""}"
            data-action="toggle"
            data-id="${task.id}">
            ${task.completed ? "✓" : ""}
          </button>

          <div>
            <p class="task-name ${task.completed ? "done" : ""}">
              ${escapeHtml(task.name)}
            </p>

            <div class="task-meta">
              <span class="subject-tag">${escapeHtml(task.subject)}</span>
              <span class="date-tag">${formatDate(task.date)}</span>
              <span class="${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
          </div>

          <button class="delete-button"
            data-action="delete"
            data-id="${task.id}">
            ×
          </button>
        `;

        taskList.appendChild(item);
      });
  }

  updateDashboard();
}

function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  completedTasks.textContent = completed;
  totalTasks.textContent = `/${total}`;
  pendingTasks.textContent = pending;

  progressPercentage.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `${completed} of ${total} tasks completed`;

  if (total === 0) {
    quoteBox.innerHTML = "<span>✦</span><p>Add your first study task and start building consistency.</p>";
  } else if (percentage === 100) {
    quoteBox.innerHTML = "<span>★</span><p>Excellent work! You completed everything planned for today.</p>";
  } else if (percentage >= 60) {
    quoteBox.innerHTML = "<span>⚡</span><p>Strong progress. Finish one more important task today.</p>";
  } else {
    quoteBox.innerHTML = "<span>✦</span><p>Small progress every day creates big success.</p>";
  }
}

function openModal() {
  modal.classList.remove("hidden");
  document.getElementById("taskName").focus();
}

function hideModal() {
  modal.classList.add("hidden");
  taskForm.reset();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  const confirmed = confirm(`Delete this task?\n\n${task.name}`);

  if (!confirmed) {
    return;
  }

  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
}

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");

  themeIcon.textContent = isDark ? "☀" : "☾";
  themeText.textContent = isDark ? "Light Mode" : "Dark Mode";

  localStorage.setItem("btechStudyFlowTheme", isDark ? "dark" : "light");
}

function setGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    greeting.textContent = "GOOD MORNING";
  } else if (hour < 18) {
    greeting.textContent = "GOOD AFTERNOON";
  } else {
    greeting.textContent = "GOOD EVENING";
  }
}

function setTodayDate() {
  todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

function showTimer() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startOrPauseTimer() {
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    startTimer.textContent = "Resume Focus";
    return;
  }

  isTimerRunning = true;
  startTimer.textContent = "Pause Focus";

  timerInterval = setInterval(() => {
    timerSeconds--;

    showTimer();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      startTimer.textContent = "Start Focus";
      alert("Focus session complete! Take a 5-minute break.");
    }
  }, 1000);
}

function resetFocusTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSeconds = 25 * 60;
  startTimer.textContent = "Start Focus";
  showTimer();
}

openTaskModal.addEventListener("click", openModal);
openTaskModalSecond.addEventListener("click", openModal);
emptyTaskButton.addEventListener("click", openModal);
closeModal.addEventListener("click", hideModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    hideModal();
  }
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("taskName").value.trim();
  const subject = document.getElementById("taskSubject").value;
  const priority = document.getElementById("taskPriority").value;
  const date = document.getElementById("taskDate").value;

  if (!name) {
    return;
  }

  tasks.unshift({
    id: Date.now(),
    name,
    subject,
    priority,
    date,
    completed: false
  });

  saveTasks();
  hideModal();
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);

  if (button.dataset.action === "toggle") {
    toggleTask(id);
  }

  if (button.dataset.action === "delete") {
    deleteTask(id);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderTasks();
  });
});

subjectFilter.addEventListener("change", renderTasks);

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  updateThemeButton();
});

scrollTimetableButton.addEventListener("click", () => {
  document.getElementById("timetable").scrollIntoView({
    behavior: "smooth"
  });
});

startTimer.addEventListener("click", startOrPauseTimer);
resetTimer.addEventListener("click", resetFocusTimer);

const savedTheme = localStorage.getItem("btechStudyFlowTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

year.textContent = new Date().getFullYear();

setGreeting();
setTodayDate();
updateThemeButton();
showTimer();
renderTasks();