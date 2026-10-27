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

async function initBoard() {
  initBoardEvents();
  await loadTasks();
  renderBoard();
}

function initBoardEvents() {
  const boardElement = document.querySelector('.boardColumns');
  boardElement.addEventListener('dragstart', startDragging);
  boardElement.addEventListener('dragover', allowDrop);
  boardElement.addEventListener('dragleave', removeHighlight);
  boardElement.addEventListener('drop', moveTask);
  boardElement.addEventListener('dragend', renderBoard);
  boardElement.addEventListener('click', openTaskDialog);
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
  let boardHtml = '';
  for (const column of boardColumns) {
    let tasksHtml = '';
    for (const task of storedTasks) {
      if (task.status === column.status && matchesSearch(task, searchText)) tasksHtml += taskCardTemplate(task);
    }
    boardHtml += boardColumnTemplate(column, tasksHtml);
  }
  document.querySelector('.boardColumns').innerHTML = boardHtml;
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
  event.dataTransfer.setData('text/plain', taskCard.dataset.taskId);
  setTimeout(function () {
    taskCard.classList.add('taskCardDragging');
  });
}

function allowDrop(event) {
  const taskArea = event.target.closest('.columnTasks');
  if (!taskArea) return;
  event.preventDefault();
  if (!taskArea.querySelector('.taskCardDragging')) {
    taskArea.classList.add('columnTasksHighlight');
  }
}

function removeHighlight(event) {
  const taskArea = event.target.closest('.columnTasks');
  if (taskArea && !taskArea.contains(event.relatedTarget)) {
    taskArea.classList.remove('columnTasksHighlight');
  }
}

function moveTask(event) {
  event.preventDefault();
  const newStatus = event.target.closest('.boardColumn').dataset.status;
  const task = findStoredTask(event.dataTransfer.getData('text/plain'));
  if (task.status !== newStatus) {
    task.status = newStatus;
    saveTaskChanges(task.id);
  }
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
