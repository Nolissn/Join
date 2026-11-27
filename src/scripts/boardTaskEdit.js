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
  const subtaskList = form.querySelector('.taskEditSubtaskList');
  subtaskList.insertAdjacentHTML('beforeend', subtaskHtml);
  subtaskList.scrollTop = subtaskList.scrollHeight;
  input.value = '';
  input.focus();
}


/**
 * Adds a new subtask or saves the edited subtask when Enter is pressed, so the form is not submitted.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleEditKeydown(event) {
  if (event.key !== 'Enter') return;
  if (event.target.matches('.taskEditNewSubtask')) {
    event.preventDefault();
    addEditSubtask(event.target.closest('.taskEditForm'));
  }
  if (event.target.matches('.taskEditSubtaskInput')) {
    event.preventDefault();
    saveEditSubtask(event.target.closest('.taskEditSubtask'));
  }
}


/**
 * Opens the edit mode of a subtask in the edit form on double click.
 * @param {MouseEvent} event - The dblclick event.
 */
function handleEditSubtaskDoubleClick(event) {
  const item = event.target.closest('.taskEditSubtask');
  if (!item || item.classList.contains('subtask-item-editing')) return;
  startEditSubtask(item);
}


/**
 * Shows a subtask of the edit form in edit mode and places the cursor at the end of the text.
 * A subtask that is still in edit mode is saved first.
 * @param {HTMLLIElement} item - The subtask to edit.
 */
function startEditSubtask(item) {
  const openItem = item.closest('.taskEditSubtaskList').querySelector('.subtask-item-editing');
  if (openItem === item) return;
  if (openItem) saveEditSubtask(openItem);
  const title = item.querySelector('.taskEditSubtaskTitle').textContent;
  item.classList.add('subtask-item-editing');
  item.innerHTML = taskEditSubtaskEditTemplate(title);
  const input = item.querySelector('.taskEditSubtaskInput');
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}


/**
 * Takes over the edited title of a subtask in the edit form. An empty title removes the subtask.
 * @param {HTMLLIElement} item - The subtask in edit mode.
 */
function saveEditSubtask(item) {
  const title = item.querySelector('.taskEditSubtaskInput').value.trim();
  if (title === '') return item.remove();
  item.outerHTML = taskEditSubtaskTemplate({ title: title, done: item.dataset.done === 'true' });
}


/**
 * Saves the edited task and renders the board again.
 * The submit button stays disabled until Firebase has answered, then the updated detail view is shown.
 * @param {SubmitEvent} event - The submit event of the edit form.
 * @returns {Promise<void>}
 */
async function saveTaskEdit(event) {
  event.preventDefault();
  const form = event.target;
  if (!isTaskEditValid(form)) return;
  form.querySelector('.taskEditSubmit').disabled = true;
  const task = findStoredTask(form.dataset.taskId);
  updateTaskFromForm(task, form);
  renderBoard();
  const isSaved = await saveTaskChanges(task.id);
  if (form.isConnected) showTaskDetail(task);
  if (isSaved) showToast('Task updated');
}


/**
 * Validates the required fields of the edit form and focuses the first invalid field.
 * @param {HTMLFormElement} form - The edit form.
 * @returns {boolean} True if all required fields are filled.
 */
function isTaskEditValid(form) {
  const isTitleValid = validateEditField(form.elements.title);
  const isDueDateValid = validateEditField(form.elements.dueDate);
  const firstInvalidInput = form.querySelector('.taskEditFieldInvalid .taskEditInput, .taskEditFieldTooEarly .taskEditInput');
  if (firstInvalidInput) firstInvalidInput.focus();
  return isTitleValid && isDueDateValid;
}


/**
 * Returns the earliest due date that can be set while editing a task.
 * Tasks without creation date allow the earlier date of their due date and today.
 * @param {Task} task - The task to edit.
 * @returns {string} The earliest allowed date in the format YYYY-MM-DD.
 */
function getEditMinDueDate(task) {
  if (task.createdAt) return task.createdAt;
  const today = getTodayDateString();
  return task.dueDate && task.dueDate < today ? task.dueDate : today;
}


/**
 * Checks whether a required field of the edit form is filled and not before its minimum date.
 * Shows or hides the matching error message.
 * @param {HTMLInputElement} input - The required input.
 * @returns {boolean} True if the input is valid.
 */
function validateEditField(input) {
  const isFilled = input.value.trim() !== '';
  const isTooEarly = isFilled && input.min !== '' && input.value < input.min;
  const field = input.closest('.taskEditField');
  field.classList.toggle('taskEditFieldInvalid', !isFilled);
  field.classList.toggle('taskEditFieldTooEarly', isTooEarly);
  return isFilled && !isTooEarly;
}


/**
 * Marks the input as touched and validates an invalid field of the edit form again while the user corrects it.
 * @param {Event} event - The input event.
 */
function handleEditInput(event) {
  event.target.dataset.touched = 'true';
  if (event.target.closest('.taskEditFieldInvalid, .taskEditFieldTooEarly')) validateEditField(event.target);
}


/**
 * Validates the title or the due date of the edit form as soon as it loses the focus.
 * Untouched inputs and moving the focus to the close button are skipped.
 * @param {FocusEvent} event - The focusout event.
 */
function handleEditBlur(event) {
  const input = event.target;
  if (!input.matches('.taskEditForm [name="title"], .taskEditForm [name="dueDate"]')) return;
  if (input.dataset.touched !== 'true') return;
  if (event.relatedTarget?.closest('.taskDetailClose')) return;
  validateEditField(input);
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
    const title = getEditSubtaskTitle(item);
    if (title !== '') subtasks.push({ title: title, done: item.dataset.done === 'true' });
  }
  return subtasks;
}


/**
 * Reads the title of a subtask in the edit form, also while it is in edit mode.
 * @param {HTMLLIElement} item - The subtask.
 * @returns {string} The trimmed title.
 */
function getEditSubtaskTitle(item) {
  const input = item.querySelector('.taskEditSubtaskInput');
  if (input) return input.value.trim();
  return item.querySelector('.taskEditSubtaskTitle').textContent.trim();
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
