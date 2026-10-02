function initBoardDragAndDrop() {
  const boardColumns = document.querySelector('.boardColumns');
  boardColumns.addEventListener('dragstart', startDragging);
  boardColumns.addEventListener('dragend', endDragging);
  document.querySelectorAll('.columnTasks').forEach(addDropEvents);
}

function addDropEvents(taskArea) {
  taskArea.addEventListener('dragover', allowDrop);
  taskArea.addEventListener('dragleave', removeHighlight);
  taskArea.addEventListener('drop', moveTask);
}

function startDragging(event) {
  const taskCard = event.target.closest('.taskCard');
  if (!taskCard) return;
  event.dataTransfer.setData('text/plain', taskCard.id);
  setTimeout(() => taskCard.classList.add('taskCardDragging'));
}

function endDragging(event) {
  event.target.closest('.taskCard')?.classList.remove('taskCardDragging');
  document.querySelectorAll('.columnTasksHighlight').forEach((taskArea) => taskArea.classList.remove('columnTasksHighlight'));
}

function allowDrop(event) {
  event.preventDefault();
  const taskArea = event.currentTarget;
  if (!taskArea.querySelector('.taskCardDragging')) {
    taskArea.classList.add('columnTasksHighlight');
  }
}

function removeHighlight(event) {
  const taskArea = event.currentTarget;
  if (!taskArea.contains(event.relatedTarget)) {
    taskArea.classList.remove('columnTasksHighlight');
  }
}

function moveTask(event) {
  event.preventDefault();
  const taskArea = event.currentTarget;
  const taskCard = document.getElementById(event.dataTransfer.getData('text/plain'));
  taskArea.classList.remove('columnTasksHighlight');
  if (taskCard && taskCard.parentElement !== taskArea) {
    taskArea.appendChild(taskCard);
  }
}

function initTaskDialog() {
  const taskDialog = document.getElementById('taskDialog');
  document.querySelector('.boardColumns').addEventListener('click', handleTaskCardClick);
  taskDialog.addEventListener('click', handleTaskDialogClick);
  taskDialog.addEventListener('cancel', handleTaskDialogCancel);
}

function handleTaskCardClick(event) {
  if (event.target.closest('.taskCard')) openTaskDialog();
}

function handleTaskDialogClick(event) {
  if (event.target === event.currentTarget || event.target.closest('.taskDetailClose')) closeTaskDialog();
}

function handleTaskDialogCancel(event) {
  event.preventDefault();
  closeTaskDialog();
}

function openTaskDialog() {
  const taskDialog = document.getElementById('taskDialog');
  taskDialog.classList.add('taskDialogOpen');
  taskDialog.showModal();
}

function closeTaskDialog() {
  const taskDialog = document.getElementById('taskDialog');
  taskDialog.addEventListener('transitionend', () => taskDialog.close(), { once: true });
  taskDialog.classList.remove('taskDialogOpen');
}

function initBoard() {
  initBoardDragAndDrop();
  initTaskDialog();
}

document.addEventListener('DOMContentLoaded', initBoard);
