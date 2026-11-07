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

async function initBoard() {
  initBoardEvents();
  await loadTasks();
  renderBoard();
}

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
}

function initTaskDialogEvents() {
  const taskDialog = document.getElementById('taskDialog');
  taskDialog.addEventListener('click', handleDialogClick);
  taskDialog.addEventListener('cancel', closeTaskDialog);
  taskDialog.addEventListener('submit', saveTaskEdit);
  taskDialog.addEventListener('keydown', handleEditKeydown);
}

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
}

function getSortedTasks() {
  const sortedTasks = storedTasks.slice();
  sortedTasks.sort(function (taskA, taskB) {
    return getTaskOrder(taskA) - getTaskOrder(taskB);
  });
  return sortedTasks;
}

function getTaskOrder(task) {
  if (typeof task.order === 'number') return task.order;
  return storedTasks.length + storedTasks.indexOf(task);
}

function matchesSearch(task, searchText) {
  const title = task.title.toLowerCase();
  const description = task.description.toLowerCase();
  return title.includes(searchText) || description.includes(searchText);
}

function clearSearch() {
  const searchInput = document.getElementById('findTask');
  searchInput.value = '';
  searchInput.focus();
  renderBoard();
}

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

function handleDragOver(event) {
  if (!mouseDrag) return;
  event.preventDefault();
  mouseDrag.pointerX = event.clientX;
  mouseDrag.pointerY = event.clientY;
  const column = event.target.closest('.boardColumn');
  if (!column) return;
  placeCardAtPointer(column.querySelector('.columnTasks'), mouseDrag.card, event.clientX, event.clientY);
}

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

function getScrollStep(pointer, areaStart, areaEnd) {
  if (pointer - areaStart < autoScrollZone) return -getEdgeSpeed(pointer - areaStart);
  if (areaEnd - pointer < autoScrollZone) return getEdgeSpeed(areaEnd - pointer);
  return 0;
}

function getEdgeSpeed(distance) {
  const closeness = 1 - Math.max(distance, 0) / autoScrollZone;
  return Math.ceil(closeness * closeness * autoScrollMaxSpeed);
}

function endDragging() {
  if (mouseDrag) cancelAnimationFrame(mouseDrag.frameId);
  mouseDrag = null;
  renderBoard();
}

function isRowLayout(columnTasks) {
  return getComputedStyle(columnTasks).flexDirection === 'row';
}

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

function isPointerBeforeCard(card, isRow, pointerX, pointerY) {
  const cardRect = card.getBoundingClientRect();
  if (isRow) return pointerX < cardRect.left + cardRect.width / 2;
  return pointerY < cardRect.top + cardRect.height / 2;
}

function saveColumnOrder(columnTasks) {
  const status = columnTasks.closest('.boardColumn').dataset.status;
  const columnOrder = getNewColumnOrder(status, getCardIds(columnTasks));
  for (let i = 0; i < columnOrder.length; i++) {
    if (columnOrder[i].order === i) continue;
    columnOrder[i].order = i;
    saveTaskChanges(columnOrder[i].id);
  }
}

function getCardIds(columnTasks) {
  const cardIds = [];
  for (const card of columnTasks.querySelectorAll('.taskCard')) {
    cardIds.push(card.dataset.taskId);
  }
  return cardIds;
}

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

function handleBoardClick(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton && event.target.closest('.taskMoveMenu')) return;
  if (!actionButton) return openTaskDialog(event);
  const taskCard = actionButton.closest('.taskCard');
  if (actionButton.dataset.action === 'toggleMove') toggleMoveMenu(taskCard);
  if (actionButton.dataset.action === 'moveTask') moveTaskTo(taskCard.dataset.taskId, actionButton.dataset.status);
}

function toggleMoveMenu(taskCard) {
  const isOpen = taskCard.classList.contains('taskCardMoveOpen');
  closeMoveMenus();
  if (!isOpen) taskCard.classList.add('taskCardMoveOpen');
}

function closeMoveMenus() {
  for (const taskCard of document.querySelectorAll('.taskCardMoveOpen')) {
    taskCard.classList.remove('taskCardMoveOpen');
  }
}

function handleOutsideMoveClick(event) {
  if (!event.target.closest('.taskCardMoveOpen')) closeMoveMenus();
}

function moveTaskTo(taskId, newStatus) {
  const task = findStoredTask(taskId);
  task.status = newStatus;
  delete task.order;
  saveTaskChanges(task.id);
  renderBoard();
}

function openTaskDialog(event) {
  const taskCard = event.target.closest('.taskCard');
  if (!taskCard) return;
  const taskDialog = document.getElementById('taskDialog');
  showTaskDetail(findStoredTask(taskCard.dataset.taskId));
  taskDialog.classList.add('taskDialogOpen');
  taskDialog.showModal();
}

function showTaskDetail(task) {
  document.querySelector('.taskDetail').innerHTML = taskDetailTemplate(task);
}

function handleDialogClick(event) {
  const clickedBackground = event.target === event.currentTarget;
  const clickedCloseButton = event.target.closest('.taskDetailClose');
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) handleDialogAction(event, actionButton);
  if (clickedBackground || clickedCloseButton) closeTaskDialog(event);
}

function handleDialogAction(event, button) {
  const action = button.dataset.action;
  if (action === 'delete') deleteTaskFromBoard(event, button.dataset.taskId);
  if (action === 'edit') openTaskEdit(button.dataset.taskId);
  if (action === 'addSubtask') addEditSubtask(button.closest('.taskEditForm'));
  if (action === 'removeSubtask') button.closest('.taskEditSubtask').remove();
}

function deleteTaskFromBoard(event, taskId) {
  deleteStoredTask(taskId);
  renderBoard();
  closeTaskDialog(event);
}

function openTaskEdit(taskId) {
  const taskDetail = document.querySelector('.taskDetail');
  taskDetail.innerHTML = taskEditTemplate(findStoredTask(taskId));
  taskDetail.querySelector('.taskEditInput').focus();
}

function addEditSubtask(form) {
  const input = form.querySelector('.taskEditNewSubtask');
  const title = input.value.trim();
  if (title === '') return;
  const subtaskHtml = taskEditSubtaskTemplate({ title: title, done: false });
  form.querySelector('.taskEditSubtaskList').insertAdjacentHTML('beforeend', subtaskHtml);
  input.value = '';
  input.focus();
}

function handleEditKeydown(event) {
  if (event.key !== 'Enter' || !event.target.matches('.taskEditNewSubtask')) return;
  event.preventDefault();
  addEditSubtask(event.target.closest('.taskEditForm'));
}

function saveTaskEdit(event) {
  event.preventDefault();
  const form = event.target;
  const task = findStoredTask(form.dataset.taskId);
  updateTaskFromForm(task, form);
  saveTaskChanges(task.id);
  renderBoard();
  showTaskDetail(task);
}

function updateTaskFromForm(task, form) {
  const formData = new FormData(form);
  task.title = formData.get('title').trim();
  task.description = formData.get('description').trim();
  task.dueDate = formData.get('dueDate');
  task.priority = formData.get('priority');
  task.subtasks = getEditedSubtasks(form);
}

function getEditedSubtasks(form) {
  const subtasks = [];
  for (const item of form.querySelectorAll('.taskEditSubtask')) {
    const title = item.querySelector('.taskEditSubtaskInput').value.trim();
    if (title !== '') subtasks.push({ title: title, done: item.dataset.done === 'true' });
  }
  return subtasks;
}

function closeTaskDialog(event) {
  event.preventDefault();
  const taskDialog = document.getElementById('taskDialog');
  taskDialog.addEventListener('transitionend', function () {
    taskDialog.close();
  }, { once: true });
  taskDialog.classList.remove('taskDialogOpen');
}

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

function getSubtasksHtml(subtasks) {
  let subtasksHtml = '';
  for (const subtask of subtasks) {
    let checkedAttribute = '';
    if (subtask.done) checkedAttribute = 'checked';
    subtasksHtml += taskDetailSubtaskTemplate(subtask.title, checkedAttribute);
  }
  return subtasksHtml;
}

function getMoveOptionsHtml(status) {
  const index = boardColumns.findIndex(column => column.status === status);
  let optionsHtml = '';
  if (index > 0) optionsHtml += taskMoveOptionTemplate(boardColumns[index - 1], 'upward');
  if (index < boardColumns.length - 1) optionsHtml += taskMoveOptionTemplate(boardColumns[index + 1], 'downward');
  return optionsHtml;
}

function getEditPrioritiesHtml(selectedPriority) {
  let prioritiesHtml = '';
  for (const priority in priorities) {
    let checkedAttribute = '';
    if (priority === selectedPriority) checkedAttribute = 'checked';
    prioritiesHtml += taskEditPriorityTemplate(priority, checkedAttribute);
  }
  return prioritiesHtml;
}

function getEditSubtasksHtml(subtasks) {
  let subtasksHtml = '';
  for (const subtask of subtasks) {
    subtasksHtml += taskEditSubtaskTemplate(subtask);
  }
  return subtasksHtml;
}

function getProgressHtml(subtasks) {
  if (subtasks.length === 0) return '';
  let doneCount = 0;
  for (const subtask of subtasks) {
    if (subtask.done) doneCount++;
  }
  return taskProgressTemplate(doneCount, subtasks.length);
}

function formatDueDate(dueDate) {
  if (dueDate === '') return '';
  const dateParts = dueDate.split('-');
  return dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
}

document.addEventListener('DOMContentLoaded', initBoard);
