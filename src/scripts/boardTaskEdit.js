let editContacts = [];


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
