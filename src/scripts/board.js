const boardColumns = [
  { status: 'todo', title: 'To do' },
  { status: 'inProgress', title: 'In progress' },
  { status: 'awaitFeedback', title: 'Await feedback' },
  { status: 'done', title: 'Done' }
];

const priorities = {
  urgent: { label: 'Urgent', icon: 'urgent.svg', editClass: 'taskEditPriorityUrgent' },
  medium: { label: 'Medium', icon: 'medium_orange.svg', editClass: 'taskEditPriorityMedium' },
  low: { label: 'Low', icon: 'low.svg', editClass: 'taskEditPriorityLow' }
};

const categoryClasses = {
  'User Story': 'categoryUserStory',
  'Technical Task': 'categoryTechnicalTask'
};

const avatarColors = ['avatarOrange', 'avatarTurquoise', 'avatarPurple'];
const maxCardAvatars = 4;


/**
 * Initializes the board: registers the events, loads the tasks and contacts and renders the board.
 * @returns {Promise<void>}
 */
async function initBoard() {
  initBoardEvents();
  await loadTasks();
  await loadContacts();
  renderBoard();
}


/**
 * Registers all event listeners of the board, the search and the dialogs.
 */
function initBoardEvents() {
  const boardElement = document.querySelector('.boardColumns');
  boardElement.addEventListener('dragstart', startDragging);
  boardElement.addEventListener('dragend', endDragging);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', moveTask);
  boardElement.addEventListener('click', handleBoardClick);
  initTouchSortEvents(boardElement);
  document.addEventListener('click', handleOutsideMoveClick);
  document.getElementById('findTask').addEventListener('input', renderBoard);
  document.querySelector('.boardSearchClear').addEventListener('click', clearSearch);
  initTaskDialogEvents();
  initAddTaskDialogEvents();
}


/**
 * Registers the event listeners of the task detail dialog./Users/shoffi/Desktop/Develooper Akademie/Modul 10 - Gruppenarbeit/Join_Docs/Join Checkliste.docx /Users/shoffi/Desktop/Develooper Akademie/Modul 10 - Gruppenarbeit/Join_Docs/Join Checkliste.pdf
 */
function initTaskDialogEvents() {
  const taskDialog = document.getElementById('taskDialog');
  taskDialog.addEventListener('click', handleDialogClick);
  taskDialog.addEventListener('cancel', closeTaskDialog);
  taskDialog.addEventListener('submit', saveTaskEdit);
  taskDialog.addEventListener('keydown', handleEditKeydown);
  taskDialog.addEventListener('change', handleSubtaskToggle);
  taskDialog.addEventListener('change', handleAssignChange);
  taskDialog.addEventListener('input', handleEditInput);
}


/**
 * Registers the event listeners of the add task dialog.
 * A click on the backdrop closes the dialog.
 */
function initAddTaskDialogEvents() {
  const addTaskDialog = document.getElementById('addTaskDialog');
  addTaskDialog.addEventListener('click', function (event) {
    if (event.target === addTaskDialog) closeAddTaskDialog();
  });
  addTaskDialog.addEventListener('close', unlockPageScroll);
}


/**
 * Prevents the page from scrolling while a dialog is open.
 */
function lockPageScroll() {
  document.body.classList.add('bodyScrollLocked');
}


/**
 * Allows the page to scroll again after a dialog is closed.
 */
function unlockPageScroll() {
  document.body.classList.remove('bodyScrollLocked');
}


/**
 * Renders all board columns with the tasks that match the search text.
 */
function renderBoard() {
  const searchText = document.getElementById('findTask').value.trim().toLowerCase();
  const sortedTasks = getSortedTasks();
  let boardHtml = '';
  for (const column of boardColumns) {
    let tasksHtml = '';
    for (const task of sortedTasks) {
      if (task.status === column.status && matchesSearch(task, searchText)) tasksHtml += taskCardTemplate(task);
    }
    boardHtml += boardColumnTemplate(column, tasksHtml);
  }
  document.querySelector('.boardColumns').innerHTML = boardHtml;
  updateNoResultsMessage(searchText, sortedTasks);
}


/**
 * Shows the "No results found" message if a search text is entered and no task matches it.
 * @param {string} searchText - The search text in lowercase.
 * @param {Task[]} tasks - All tasks of the board.
 */
function updateNoResultsMessage(searchText, tasks) {
  const hasResults = tasks.some(task => matchesSearch(task, searchText));
  const showMessage = searchText !== '' && !hasResults;
  document.getElementById('boardNoResults').classList.toggle('boardNoResultsVisible', showMessage);
}


/**
 * Returns a copy of the stored tasks sorted by their order.
 * @returns {Task[]} The sorted tasks.
 */
function getSortedTasks() {
  const sortedTasks = storedTasks.slice();
  sortedTasks.sort(function (taskA, taskB) {
    return getTaskOrder(taskA) - getTaskOrder(taskB);
  });
  return sortedTasks;
}


/**
 * Returns the sort position of a task.
 * Tasks without an order are placed after all ordered tasks.
 * @param {Task} task - The task to sort.
 * @returns {number} The sort position.
 */
function getTaskOrder(task) {
  if (typeof task.order === 'number') return task.order;
  return storedTasks.length + storedTasks.indexOf(task);
}


/**
 * Checks whether the title or the description of a task contains the search text.
 * @param {Task} task - The task to check.
 * @param {string} searchText - The search text in lowercase.
 * @returns {boolean} True if the task matches the search text.
 */
function matchesSearch(task, searchText) {
  const title = task.title.toLowerCase();
  const description = task.description.toLowerCase();
  return title.includes(searchText) || description.includes(searchText);
}


/**
 * Clears the search field, focuses it and renders the board again.
 */
function clearSearch() {
  const searchInput = document.getElementById('findTask');
  searchInput.value = '';
  searchInput.focus();
  renderBoard();
}


/**
 * Handles clicks on the board: toggles the move menu, moves a task or opens the task detail.
 * @param {MouseEvent} event - The click event.
 */
function handleBoardClick(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton && event.target.closest('.taskMoveMenu')) return;
  if (!actionButton) return openTaskDialog(event);
  const taskCard = actionButton.closest('.taskCard');
  if (actionButton.dataset.action === 'toggleMove') toggleMoveMenu(taskCard);
  if (actionButton.dataset.action === 'moveTask') moveTaskTo(taskCard.dataset.taskId, actionButton.dataset.status);
}


/**
 * Opens the move menu of a card and closes all other move menus.
 * Closes the menu if it was already open.
 * @param {HTMLElement} taskCard - The task card of the clicked button.
 */
function toggleMoveMenu(taskCard) {
  const isOpen = taskCard.classList.contains('taskCardMoveOpen');
  closeMoveMenus();
  if (!isOpen) taskCard.classList.add('taskCardMoveOpen');
}


/**
 * Closes all open move menus.
 */
function closeMoveMenus() {
  for (const taskCard of document.querySelectorAll('.taskCardMoveOpen')) {
    taskCard.classList.remove('taskCardMoveOpen');
  }
}


/**
 * Closes all move menus when the click is outside an open move menu.
 * @param {MouseEvent} event - The click event.
 */
function handleOutsideMoveClick(event) {
  if (!event.target.closest('.taskCardMoveOpen')) closeMoveMenus();
}


/**
 * Moves a task to another column, removes its order and renders the board again.
 * @param {string} taskId - The id of the task.
 * @param {string} newStatus - The status of the target column.
 */
function moveTaskTo(taskId, newStatus) {
  const task = findStoredTask(taskId);
  task.status = newStatus;
  delete task.order;
  saveTaskChanges(task.id);
  renderBoard();
  showToast('Task moved to ' + boardColumns.find(column => column.status === newStatus).title);
}


/**
 * Builds the avatar HTML of the assigned contacts.
 * The card view shows at most maxCardAvatars avatars and a "+N" avatar for the rest.
 * @param {Object[]} contacts - The assigned contacts.
 * @param {string} view - "detail" for the detail view, otherwise the card view is used.
 * @returns {string} The avatar HTML.
 */
function getAvatarsHtml(contacts, view) {
  if (view === 'detail') return getDetailAssigneesHtml(contacts);
  let avatarsHtml = '';
  for (let i = 0; i < contacts.length && i < maxCardAvatars; i++) {
    avatarsHtml += taskAvatarTemplate(getInitials(contacts[i].name), avatarColors[i % avatarColors.length]);
  }
  if (contacts.length > maxCardAvatars) {
    avatarsHtml += taskAvatarTemplate('+' + (contacts.length - maxCardAvatars), 'avatarMore');
  }
  return avatarsHtml;
}


/**
 * Builds the list of all assigned contacts with avatar and name for the detail view.
 * @param {Object[]} contacts - The assigned contacts.
 * @returns {string} The assignee list HTML.
 */
function getDetailAssigneesHtml(contacts) {
  let assigneesHtml = '';
  for (let i = 0; i < contacts.length; i++) {
    const avatarColor = avatarColors[i % avatarColors.length];
    assigneesHtml += taskDetailAssigneeTemplate(getInitials(contacts[i].name), avatarColor, contacts[i].name);
  }
  return assigneesHtml;
}


/**
 * Builds the move menu options for the previous and the next column.
 * @param {string} status - The current status of the task.
 * @returns {string} The move options HTML.
 */
function getMoveOptionsHtml(status) {
  const index = boardColumns.findIndex(column => column.status === status);
  let optionsHtml = '';
  if (index > 0) optionsHtml += taskMoveOptionTemplate(boardColumns[index - 1], 'upward');
  if (index < boardColumns.length - 1) optionsHtml += taskMoveOptionTemplate(boardColumns[index + 1], 'downward');
  return optionsHtml;
}


/**
 * Builds the subtask progress bar of a task card.
 * @param {Subtask[]} subtasks - The subtasks of the task.
 * @returns {string} The progress HTML, or an empty string if the task has no subtasks.
 */
function getProgressHtml(subtasks) {
  if (subtasks.length === 0) return '';
  let doneCount = 0;
  for (const subtask of subtasks) {
    if (subtask.done) doneCount++;
  }
  return taskProgressTemplate(doneCount, subtasks.length);
}


/**
 * Converts a due date from YYYY-MM-DD to DD/MM/YYYY.
 * @param {string} dueDate - The due date in the format YYYY-MM-DD.
 * @returns {string} The formatted date, or an empty string if no date is set.
 */
function formatDueDate(dueDate) {
  if (dueDate === '') return '';
  const dateParts = dueDate.split('-');
  return dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
}


/**
 * Opens the add task dialog, renders and initializes the form and locks the page scroll.
 */
function openAddTaskDialog() {
  const addTaskDialog = document.getElementById('addTaskDialog');
  if (addTaskDialog.open) return;
  const content = addTaskDialog.querySelector('.add-task-dialog-content');
  content.innerHTML = renderAddTaskDialog();
  initializeAddTaskForm(content.querySelector('#addTaskForm'));
  addTaskDialog.showModal();
  lockPageScroll();
}


/**
 * Closes the add task dialog if it is open.
 */
function closeAddTaskDialog() {
  const addTaskDialog = document.getElementById('addTaskDialog');
  if (addTaskDialog.open) addTaskDialog.close();
}

document.addEventListener('DOMContentLoaded', initBoard);
