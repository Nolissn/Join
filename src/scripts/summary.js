const taskCounts = {
    todo: 0,
    done: 0,
    urgent: 0,
    inProgress: 0,
    awaitFeedback: 0
  };

/**
 * @typedef {Object} SummaryElements
 * @property {HTMLElement} greetingContainer - The container of the greeting.
 * @property {HTMLElement} greetingElement - The element that shows the greeting text.
 * @property {HTMLElement} nameElement - The element that shows the user name.
 */

/**
 * Initializes the summary page: renders the greeting, loads the tasks and shows the task counts.
 * @returns {Promise<void>}
 */
async function initSummary() {
  const summaryElements = getSummaryElements();
  if (summaryElements === null) return;

  renderSummaryGreeting(summaryElements);

  await loadTasks();
  renderTaskSummary();
}

/**
 * Renders the greeting for the logged-in user or the guest.
 * Plays the intro animation once after the login.
 * @param {SummaryElements} summaryElements - The elements of the greeting.
 */
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

/**
 * Returns the elements of the greeting.
 * @returns {SummaryElements|null} The elements, or null if one of them is missing.
 */
function getSummaryElements() {
  const greetingContainer = document.querySelector(".summary-greeting");
  const greetingElement = document.querySelector(".summary-greeting .greeting-message");
  const nameElement = document.querySelector(".summary-greeting .name");
  if (greetingContainer === null || greetingElement === null || nameElement === null) return null;
  return { greetingContainer, greetingElement, nameElement };
}

/**
 * Counts the tasks per status and the urgent open tasks and shows the counts.
 */
function renderTaskSummary() {
  for (const task of storedTasks) {
    if (Object.prototype.hasOwnProperty.call(taskCounts, task.status)) {
      taskCounts[task.status]++;
    }
    if (task.priority === "urgent" && task.status !== "done") taskCounts.urgent++;
  }

  getToDos(taskCounts);
}

/**
 * Shows the task counts and the upcoming deadline on the summary page.
 * @param {Object} taskCounts - The number of tasks per status and of urgent open tasks.
 */
function getToDos(taskCounts) {
  document.getElementById("summaryTodoCount").textContent = taskCounts.todo;
  document.getElementById("summaryDoneCount").textContent = taskCounts.done;
  document.getElementById("summaryUrgentCount").textContent = taskCounts.urgent;
  document.getElementById("summaryBoardCount").textContent = storedTasks.length;
  document.getElementById("summaryInProgressCount").textContent = taskCounts.inProgress;
  document.getElementById("summaryAwaitFeedbackCount").textContent = taskCounts.awaitFeedback;
  document.getElementById("summaryUpcomingDeadline").textContent = getUpcomingDeadline();
}

/**
 * Returns the earliest due date of all tasks that are not done.
 * @returns {string} The formatted date, or "No deadline" if no open task has a due date.
 */
function getUpcomingDeadline() {
  const upcomingDates = storedTasks
    .filter((task) => task.status !== "done" && isValidDate(task.dueDate))
    .map((task) => task.dueDate)
    .sort();

  if (upcomingDates.length === 0) return "No deadline";

  return getDateTime(upcomingDates[0]);
}

/**
 * Formats a date as a long English date, e.g. "October 5, 2026".
 * @param {string} dateString - The date in the format YYYY-MM-DD.
 * @returns {string} The formatted date.
 */
function getDateTime(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * Checks whether a value is an existing date in the format YYYY-MM-DD.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a valid date.
 */
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

/**
 * Shows the greeting with the name of the logged-in user.
 * @param {SummaryElements} summaryElements - The elements of the greeting.
 */
function renderCurrentUser({ greetingElement, nameElement }) {
  greetingElement.textContent = "Good Morning,";
  nameElement.textContent = currentUser.name;
}

/**
 * Shows a greeting for the guest that depends on the time of day.
 * @param {SummaryElements} summaryElements - The elements of the greeting.
 */
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