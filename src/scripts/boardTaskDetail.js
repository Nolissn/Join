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
