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
const autoScrollZone = 80;
const autoScrollMaxSpeed = 18;
let mouseDrag = null;
let previousBodyOverflow = null;
let editContacts = [];

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
 * Prevents the page from scrolling while a dialog is open and remembers the previous overflow value.
 */
function lockPageScroll() {
  if (previousBodyOverflow !== null) return;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

/**
 * Restores the previous scroll behavior of the page.
 */
function unlockPageScroll() {
  if (previousBodyOverflow === null) return;
  document.body.style.overflow = previousBodyOverflow;
  previousBodyOverflow = null;
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
 * Starts dragging a task card with the mouse and starts the auto scroll.
 * Mouse dragging is blocked while a touch sort is active.
 * @param {DragEvent} event - The dragstart event.
 */
function startDragging(event) {
  const taskCard = event.target.closest('.taskCard');
  if (!taskCard) return;
  if (touchSort) return event.preventDefault();
  event.dataTransfer.setData('text/plain', taskCard.dataset.taskId);
  mouseDrag = { card: taskCard, pointerX: event.clientX, pointerY: event.clientY };
  mouseDrag.frameId = requestAnimationFrame(autoScrollWhileDragging);
  setTimeout(function () {
    taskCard.classList.add('taskCardDragging');
  });
}

/**
 * Updates the pointer position while dragging and places the card in the column below the pointer.
 * @param {DragEvent} event - The dragover event.
 */
function handleDragOver(event) {
  if (!mouseDrag) return;
  event.preventDefault();
  mouseDrag.pointerX = event.clientX;
  mouseDrag.pointerY = event.clientY;
  const column = event.target.closest('.boardColumn');
  if (!column) return;
  placeCardAtPointer(column.querySelector('.columnTasks'), mouseDrag.card, event.clientX, event.clientY);
}

/**
 * Drops the dragged card and saves its new status and the new order of the column.
 * @param {DragEvent} event - The drop event.
 */
function moveTask(event) {
  if (!mouseDrag) return;
  event.preventDefault();
  const columnTasks = mouseDrag.card.closest('.columnTasks');
  const newStatus = columnTasks.closest('.boardColumn').dataset.status;
  const task = findStoredTask(mouseDrag.card.dataset.taskId);
  if (task.status !== newStatus) {
    task.status = newStatus;
    saveTaskChanges(task.id);
  }
  saveColumnOrder(columnTasks);
  endDragging();
}

/**
 * Scrolls the page and, in row layout, the column when the pointer is near an edge.
 * Runs on every animation frame while a card is dragged.
 */
function autoScrollWhileDragging() {
  const columnTasks = mouseDrag.card.closest('.columnTasks');
  const columnRect = columnTasks.getBoundingClientRect();
  const scrollDown = getScrollStep(mouseDrag.pointerY, 0, window.innerHeight);
  window.scrollBy({ top: scrollDown, behavior: 'instant' });
  if (isRowLayout(columnTasks)) {
    const scrollRight = getScrollStep(mouseDrag.pointerX, columnRect.left, columnRect.right);
    columnTasks.scrollBy({ left: scrollRight, behavior: 'instant' });
  }
  placeCardAtPointer(columnTasks, mouseDrag.card, mouseDrag.pointerX, mouseDrag.pointerY);
  mouseDrag.frameId = requestAnimationFrame(autoScrollWhileDragging);
}

/**
 * Calculates the scroll step for a pointer near the start or the end of an area.
 * @param {number} pointer - The pointer position in pixels.
 * @param {number} areaStart - The start of the area in pixels.
 * @param {number} areaEnd - The end of the area in pixels.
 * @returns {number} A negative step towards the start, a positive step towards the end, or 0.
 */
function getScrollStep(pointer, areaStart, areaEnd) {
  if (pointer - areaStart < autoScrollZone) return -getEdgeSpeed(pointer - areaStart);
  if (areaEnd - pointer < autoScrollZone) return getEdgeSpeed(areaEnd - pointer);
  return 0;
}

/**
 * Calculates the scroll speed. The closer the pointer is to the edge, the faster it scrolls.
 * @param {number} distance - The distance between the pointer and the edge in pixels.
 * @returns {number} The scroll speed in pixels per frame.
 */
function getEdgeSpeed(distance) {
  const closeness = 1 - Math.max(distance, 0) / autoScrollZone;
  return Math.ceil(closeness * closeness * autoScrollMaxSpeed);
}

/**
 * Stops the auto scroll, resets the drag state and renders the board again.
 */
function endDragging() {
  if (mouseDrag) cancelAnimationFrame(mouseDrag.frameId);
  mouseDrag = null;
  renderBoard();
}

/**
 * Checks whether the tasks of a column are laid out in a row.
 * @param {HTMLElement} columnTasks - The task container of a column.
 * @returns {boolean} True if the flex direction is row.
 */
function isRowLayout(columnTasks) {
  return getComputedStyle(columnTasks).flexDirection === 'row';
}

/**
 * Moves a card in front of the first card that lies after the pointer, or to the end of the column.
 * @param {HTMLElement} columnTasks - The task container of the column.
 * @param {HTMLElement} movingCard - The card that is moved.
 * @param {number} pointerX - The horizontal pointer position in pixels.
 * @param {number} pointerY - The vertical pointer position in pixels.
 */
function placeCardAtPointer(columnTasks, movingCard, pointerX, pointerY) {
  const isRow = isRowLayout(columnTasks);
  for (const card of columnTasks.querySelectorAll('.taskCard')) {
    if (card === movingCard) continue;
    if (isPointerBeforeCard(card, isRow, pointerX, pointerY)) {
      if (card.previousElementSibling !== movingCard) columnTasks.insertBefore(movingCard, card);
      return;
    }
  }
  if (columnTasks.lastElementChild !== movingCard) columnTasks.appendChild(movingCard);
}

/**
 * Checks whether the pointer lies before the middle of a card.
 * @param {HTMLElement} card - The card to compare with.
 * @param {boolean} isRow - Whether the column is laid out in a row.
 * @param {number} pointerX - The horizontal pointer position in pixels.
 * @param {number} pointerY - The vertical pointer position in pixels.
 * @returns {boolean} True if the pointer lies before the middle of the card.
 */
function isPointerBeforeCard(card, isRow, pointerX, pointerY) {
  const cardRect = card.getBoundingClientRect();
  if (isRow) return pointerX < cardRect.left + cardRect.width / 2;
  return pointerY < cardRect.top + cardRect.height / 2;
}

/**
 * Saves the order of the cards in a column and uploads every task whose order has changed.
 * @param {HTMLElement} columnTasks - The task container of the column.
 */
function saveColumnOrder(columnTasks) {
  const status = columnTasks.closest('.boardColumn').dataset.status;
  const columnOrder = getNewColumnOrder(status, getCardIds(columnTasks));
  for (let i = 0; i < columnOrder.length; i++) {
    if (columnOrder[i].order === i) continue;
    columnOrder[i].order = i;
    saveTaskChanges(columnOrder[i].id);
  }
}

/**
 * Returns the task ids of all cards in a column in their visible order.
 * @param {HTMLElement} columnTasks - The task container of the column.
 * @returns {string[]} The task ids.
 */
function getCardIds(columnTasks) {
  const cardIds = [];
  for (const card of columnTasks.querySelectorAll('.taskCard')) {
    cardIds.push(card.dataset.taskId);
  }
  return cardIds;
}

/**
 * Builds the new order of all tasks in a column.
 * Visible tasks take the order of the cards, hidden tasks keep their position.
 * @param {string} status - The status of the column.
 * @param {string[]} visibleIds - The ids of the visible cards in their order.
 * @returns {Task[]} The tasks of the column in their new order.
 */
function getNewColumnOrder(status, visibleIds) {
  const remainingIds = visibleIds.slice();
  const columnOrder = [];
  for (const task of getSortedTasks()) {
    if (task.status !== status) continue;
    if (visibleIds.includes(task.id)) columnOrder.push(findStoredTask(remainingIds.shift()));
    else columnOrder.push(task);
  }
  return columnOrder;
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
 * Opens the detail dialog of the clicked task card.
 * @param {MouseEvent} event - The click event.
 */
function openTaskDialog(event) {
  const taskCard = event.target.closest('.taskCard');
  if (!taskCard) return;
  const taskDialog = document.getElementById('taskDialog');
  showTaskDetail(findStoredTask(taskCard.dataset.taskId));
  taskDialog.classList.add('taskDialogOpen');
  taskDialog.showModal();
}

/**
 * Renders the detail view of a task in the dialog.
 * @param {Task} task - The task to show.
 */
function showTaskDetail(task) {
  document.querySelector('.taskDetail').innerHTML = taskDetailTemplate(task);
}

/**
 * Handles clicks in the task dialog.
 * Runs the clicked action and closes the dialog on a click on the backdrop or the close button.
 * @param {MouseEvent} event - The click event.
 */
function handleDialogClick(event) {
  const clickedBackground = event.target === event.currentTarget;
  const clickedCloseButton = event.target.closest('.taskDetailClose');
  const actionButton = event.target.closest('[data-action]');
  closeAssignList(event);
  if (actionButton) handleDialogAction(event, actionButton);
  if (clickedBackground || clickedCloseButton) closeTaskDialog(event);
}

/**
 * Saves the done state of a subtask when its checkbox in the task detail view is toggled.
 * @param {Event} event - The change event.
 */
function handleSubtaskToggle(event) {
  if (!event.target.matches('.taskDetailCheckbox')) return;
  const taskId = event.target.closest('[data-task-id]').dataset.taskId;
  const task = findStoredTask(taskId);
  task.subtasks[event.target.dataset.subtaskIndex].done = event.target.checked;
  saveTaskChanges(task.id);
  renderBoard();
}

/**
 * Runs the action of a clicked button in the task dialog.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} button - The clicked button with a data-action attribute.
 */
function handleDialogAction(event, button) {
  const action = button.dataset.action;
  if (action === 'delete') deleteTaskFromBoard(event, button.dataset.taskId);
  if (action === 'edit') openTaskEdit(button.dataset.taskId);
  if (action === 'addSubtask') addEditSubtask(button.closest('.taskEditForm'));
  if (action === 'removeSubtask') button.closest('.taskEditSubtask').remove();
  if (action === 'toggleAssign') button.closest('.taskEditAssign').classList.toggle('taskEditAssignOpen');
}

/**
 * Closes the open contact list of the edit form when the click is outside of the assign field.
 * @param {MouseEvent} event - The click event.
 */
function closeAssignList(event) {
  const assignField = document.querySelector('.taskEditAssignOpen');
  if (assignField && !assignField.contains(event.target)) assignField.classList.remove('taskEditAssignOpen');
}

/**
 * Updates the avatar preview of the edit form when a contact is checked or unchecked.
 * @param {Event} event - The change event.
 */
function handleAssignChange(event) {
  if (!event.target.matches('.taskEditContactCheckbox')) return;
  const form = event.target.closest('.taskEditForm');
  form.querySelector('.taskEditAssignees').innerHTML = getAvatarsHtml(getEditedAssignees(form), 'card');
}

/**
 * Deletes a task, renders the board again and closes the dialog.
 * @param {Event} event - The event that triggered the deletion.
 * @param {string} taskId - The id of the task to delete.
 */
function deleteTaskFromBoard(event, taskId) {
  deleteStoredTask(taskId);
  renderBoard();
  closeTaskDialog(event);
  showToast('Task deleted');
}

/**
 * Shows the edit form of a task in the dialog and focuses the title input.
 * @param {string} taskId - The id of the task to edit.
 */
function openTaskEdit(taskId) {
  const taskDetail = document.querySelector('.taskDetail');
  taskDetail.innerHTML = taskEditTemplate(findStoredTask(taskId));
  taskDetail.querySelector('.taskEditInput').focus();
}

/**
 * Adds the entered subtask to the subtask list of the edit form and clears the input.
 * @param {HTMLFormElement} form - The edit form.
 */
function addEditSubtask(form) {
  const input = form.querySelector('.taskEditNewSubtask');
  const title = input.value.trim();
  if (title === '') return;
  const subtaskHtml = taskEditSubtaskTemplate({ title: title, done: false });
  form.querySelector('.taskEditSubtaskList').insertAdjacentHTML('beforeend', subtaskHtml);
  input.value = '';
  input.focus();
}

/**
 * Adds a subtask when Enter is pressed in the new subtask input.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleEditKeydown(event) {
  if (event.key !== 'Enter' || !event.target.matches('.taskEditNewSubtask')) return;
  event.preventDefault();
  addEditSubtask(event.target.closest('.taskEditForm'));
}

/**
 * Saves the edited task, renders the board again and shows the updated detail view.
 * @param {SubmitEvent} event - The submit event of the edit form.
 */
function saveTaskEdit(event) {
  event.preventDefault();
  const form = event.target;
  if (!isTaskEditValid(form)) return;
  const task = findStoredTask(form.dataset.taskId);
  updateTaskFromForm(task, form);
  saveTaskChanges(task.id);
  renderBoard();
  showTaskDetail(task);
  showToast('Task updated');
}

/**
 * Validates the required fields of the edit form and focuses the first invalid field.
 * @param {HTMLFormElement} form - The edit form.
 * @returns {boolean} True if all required fields are filled.
 */
function isTaskEditValid(form) {
  const isTitleValid = validateEditField(form.elements.title);
  const isDueDateValid = validateEditField(form.elements.dueDate);
  const firstInvalidInput = form.querySelector('.taskEditFieldInvalid .taskEditInput');
  if (firstInvalidInput) firstInvalidInput.focus();
  return isTitleValid && isDueDateValid;
}

/**
 * Checks whether a required field of the edit form is filled and shows or hides its error message.
 * @param {HTMLInputElement} input - The required input.
 * @returns {boolean} True if the input is not empty.
 */
function validateEditField(input) {
  const isValid = input.value.trim() !== '';
  input.closest('.taskEditField').classList.toggle('taskEditFieldInvalid', !isValid);
  return isValid;
}

/**
 * Validates an invalid field of the edit form again while the user corrects it.
 * @param {Event} event - The input event.
 */
function handleEditInput(event) {
  if (event.target.closest('.taskEditFieldInvalid')) validateEditField(event.target);
}

/**
 * Writes the values of the edit form into the task.
 * @param {Task} task - The task to update.
 * @param {HTMLFormElement} form - The edit form.
 */
function updateTaskFromForm(task, form) {
  const formData = new FormData(form);
  task.title = formData.get('title').trim();
  task.description = formData.get('description').trim();
  task.dueDate = formData.get('dueDate');
  task.priority = formData.get('priority');
  task.assignedTo = getEditedAssignees(form);
  task.subtasks = getEditedSubtasks(form);
}

/**
 * Reads the checked contacts from the edit form.
 * @param {HTMLFormElement} form - The edit form.
 * @returns {Object[]} The assigned contacts with id and name.
 */
function getEditedAssignees(form) {
  const assignees = [];
  for (const checkbox of form.querySelectorAll('.taskEditContactCheckbox:checked')) {
    assignees.push(editContacts[checkbox.value]);
  }
  return assignees;
}

/**
 * Reads the subtasks from the edit form. Empty subtasks are skipped.
 * @param {HTMLFormElement} form - The edit form.
 * @returns {Subtask[]} The edited subtasks.
 */
function getEditedSubtasks(form) {
  const subtasks = [];
  for (const item of form.querySelectorAll('.taskEditSubtask')) {
    const title = item.querySelector('.taskEditSubtaskInput').value.trim();
    if (title !== '') subtasks.push({ title: title, done: item.dataset.done === 'true' });
  }
  return subtasks;
}

/**
 * Closes the task dialog after its closing transition has finished.
 * @param {Event} event - The event that closes the dialog.
 */
function closeTaskDialog(event) {
  event.preventDefault();
  const taskDialog = document.getElementById('taskDialog');
  taskDialog.addEventListener('transitionend', function () {
    taskDialog.close();
  }, { once: true });
  taskDialog.classList.remove('taskDialogOpen');
}

/**
 * Builds the avatar HTML of the assigned contacts.
 * @param {Object[]} contacts - The assigned contacts.
 * @param {string} view - "detail" for the detail view, otherwise the card view is used.
 * @returns {string} The avatar HTML.
 */
function getAvatarsHtml(contacts, view) {
  let avatarsHtml = '';
  for (let i = 0; i < contacts.length; i++) {
    const initials = getInitials(contacts[i].name);
    const avatarColor = avatarColors[i % avatarColors.length];
    if (view === 'detail') {
      avatarsHtml += taskDetailAssigneeTemplate(initials, avatarColor, contacts[i].name);
    } else {
      avatarsHtml += taskAvatarTemplate(initials, avatarColor);
    }
  }
  return avatarsHtml;
}

/**
 * Builds the subtask list HTML of the detail view.
 * @param {Subtask[]} subtasks - The subtasks of the task.
 * @returns {string} The subtask list HTML.
 */
function getSubtasksHtml(subtasks) {
  let subtasksHtml = '';
  for (let i = 0; i < subtasks.length; i++) {
    let checkedAttribute = '';
    if (subtasks[i].done) checkedAttribute = 'checked';
    subtasksHtml += taskDetailSubtaskTemplate(subtasks[i].title, checkedAttribute, i);
  }
  return subtasksHtml;
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
 * Builds the priority radio buttons of the edit form.
 * @param {string} selectedPriority - The current priority of the task.
 * @returns {string} The priority HTML.
 */
function getEditPrioritiesHtml(selectedPriority) {
  let prioritiesHtml = '';
  for (const priority in priorities) {
    let checkedAttribute = '';
    if (priority === selectedPriority) checkedAttribute = 'checked';
    prioritiesHtml += taskEditPriorityTemplate(priority, checkedAttribute);
  }
  return prioritiesHtml;
}

/**
 * Checks whether two contacts are the same person.
 * Compares the ids if both contacts have one, otherwise the names.
 * @param {Object} contactA - The first contact.
 * @param {Object} contactB - The second contact.
 * @returns {boolean} True if both contacts are the same person.
 */
function isSameContact(contactA, contactB) {
  if (contactA.id && contactB.id) return contactA.id === contactB.id;
  return contactA.name === contactB.name;
}

/**
 * Returns all contacts for the edit form.
 * The assigned contacts come first in their card order, followed by the remaining contacts.
 * @param {Object[]} assignedTo - The contacts assigned to the task.
 * @returns {Object[]} The contacts to show in the edit form.
 */
function getEditContacts(assignedTo) {
  const contacts = assignedTo.slice();
  for (const contact of storedContacts) {
    if (contacts.some(assignee => isSameContact(assignee, contact))) continue;
    contacts.push({ id: contact.id, name: contact.name });
  }
  return contacts;
}

/**
 * Builds the contact list HTML of the edit form and remembers the shown contacts.
 * The assigned contacts are checked and keep the avatar colors of the task card.
 * @param {Object[]} assignedTo - The contacts assigned to the task.
 * @returns {string} The contact list HTML.
 */
function getEditContactsHtml(assignedTo) {
  editContacts = getEditContacts(assignedTo);
  let contactsHtml = '';
  for (let i = 0; i < editContacts.length; i++) {
    let checkedAttribute = '';
    if (i < assignedTo.length) checkedAttribute = 'checked';
    contactsHtml += taskEditContactTemplate(editContacts[i], i, avatarColors[i % avatarColors.length], checkedAttribute);
  }
  return contactsHtml;
}

/**
 * Builds the subtask list HTML of the edit form.
 * @param {Subtask[]} subtasks - The subtasks of the task.
 * @returns {string} The subtask list HTML.
 */
function getEditSubtasksHtml(subtasks) {
  let subtasksHtml = '';
  for (const subtask of subtasks) {
    subtasksHtml += taskEditSubtaskTemplate(subtask);
  }
  return subtasksHtml;
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
