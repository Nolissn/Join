const boardColumns = [
  { status: 'todo', title: 'To do' },
  { status: 'inProgress', title: 'In progress' },
  { status: 'awaitFeedback', title: 'Await feedback' },
  { status: 'done', title: 'Done' }
];

const priorities = {
  urgent: { label: 'Urgent', icon: 'urgent.svg' },
  medium: { label: 'Medium', icon: 'medium_orange.svg' },
  low: { label: 'Low', icon: 'low.svg' }
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
  const taskDialog = document.getElementById('taskDialog');
  boardElement.addEventListener('dragstart', startDragging);
  boardElement.addEventListener('dragover', allowDrop);
  boardElement.addEventListener('dragleave', removeHighlight);
  boardElement.addEventListener('drop', moveTask);
  boardElement.addEventListener('dragend', renderBoard);
  boardElement.addEventListener('click', openTaskDialog);
  taskDialog.addEventListener('click', handleDialogClick);
  taskDialog.addEventListener('cancel', closeTaskDialog);
}

function renderBoard() {
  let boardHtml = '';
  for (const column of boardColumns) {
    let tasksHtml = '';
    for (const task of storedTasks) {
      if (task.status === column.status) tasksHtml += taskCardTemplate(task);
    }
    boardHtml += boardColumnTemplate(column, tasksHtml);
  }
  document.querySelector('.boardColumns').innerHTML = boardHtml;
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
  taskDialog.querySelector('.taskDetail').innerHTML = taskDetailTemplate(findStoredTask(taskCard.dataset.taskId));
  taskDialog.classList.add('taskDialogOpen');
  taskDialog.showModal();
}

function handleDialogClick(event) {
  const clickedBackground = event.target === event.currentTarget;
  const clickedCloseButton = event.target.closest('.taskDetailClose');
  if (clickedBackground || clickedCloseButton) closeTaskDialog(event);
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

function getProgressHtml(subtasks) {
  if (subtasks.length === 0) return '';
  let doneCount = 0;
  for (const subtask of subtasks) {
    if (subtask.done) doneCount++;
  }
  return taskProgressTemplate(doneCount, subtasks.length);
}

function getInitials(name) {
  const nameParts = name.trim().split(' ');
  const firstLetter = nameParts[0].charAt(0);
  const lastLetter = nameParts[nameParts.length - 1].charAt(0);
  if (nameParts.length === 1) return firstLetter.toUpperCase();
  return (firstLetter + lastLetter).toUpperCase();
}

function formatDueDate(dueDate) {
  if (dueDate === '') return '';
  const dateParts = dueDate.split('-');
  return dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
}

document.addEventListener('DOMContentLoaded', initBoard);
