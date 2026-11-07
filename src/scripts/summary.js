const taskCounts = {
    todo: 0,
    done: 0,
    urgent: 0,
    inProgress: 0,
    awaitFeedback: 0
  };

async function initSummary() {
  const summaryElements = getSummaryElements();
  if (summaryElements === null) return;

  renderSummaryGreeting(summaryElements);

  await loadTasks();
  renderTaskSummary();
}

function renderSummaryGreeting(summaryElements) {
  if (consumeSummaryGreetingIntro()) {
    summaryElements.greetingContainer.classList.add("summary-greeting-intro");
  }

  if (currentUser && currentUser.isGuest !== true) {
    renderCurrentUser(summaryElements);
  } else {
    renderGuest(summaryElements);
  }
}

function getSummaryElements() {
  const greetingContainer = document.querySelector(".summary-greeting");
  const greetingElement = document.querySelector(".summary-greeting .greeting-message");
  const nameElement = document.querySelector(".summary-greeting .name");
  if (greetingContainer === null || greetingElement === null || nameElement === null) return null;
  return { greetingContainer, greetingElement, nameElement };
}

function renderTaskSummary() {
  for (const task of storedTasks) {
    if (Object.prototype.hasOwnProperty.call(taskCounts, task.status)) {
      taskCounts[task.status]++;
    }
    if (task.priority === "urgent" && task.status !== "done") taskCounts.urgent++;
  }

  getToDos(taskCounts);
}

function getToDos(taskCounts) {
  document.getElementById("summaryTodoCount").textContent = taskCounts.todo;
  document.getElementById("summaryDoneCount").textContent = taskCounts.done;
  document.getElementById("summaryUrgentCount").textContent = taskCounts.urgent;
  document.getElementById("summaryBoardCount").textContent = storedTasks.length;
  document.getElementById("summaryInProgressCount").textContent = taskCounts.inProgress;
  document.getElementById("summaryAwaitFeedbackCount").textContent = taskCounts.awaitFeedback;
  document.getElementById("summaryUpcomingDeadline").textContent = getUpcomingDeadline();
}

function getUpcomingDeadline() {
  const upcomingDates = storedTasks
    .filter((task) => task.status !== "done" && isValidDate(task.dueDate))
    .map((task) => task.dueDate)
    .sort();

  if (upcomingDates.length === 0) return "No deadline";

  return getDateTime(upcomingDates[0]);
}

function getDateTime(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function renderCurrentUser({ greetingElement, nameElement }) {
  greetingElement.textContent = "Good Morning,";
  nameElement.textContent = currentUser.name;
}

function renderGuest({ greetingElement, nameElement }) {
  const time = new Date().getHours();
  if (time >= 5 && time < 12) {
    greetingElement.textContent = "Good Morning";
  } else if (time >= 12 && time < 18) {
    greetingElement.textContent = "Good Afternoon";
  } else if (time >= 18 && time < 21) {
    greetingElement.textContent = "Good Evening";
  } else {
    greetingElement.textContent = "Good Night";
  }

  nameElement.textContent = "";
}

initSummary();