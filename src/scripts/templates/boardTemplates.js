/**
 * Escapes HTML special characters, so the text can be inserted into HTML safely.
 * @param {*} text - The text to escape.
 * @returns {string} The escaped text.
 */
function makeTextSafe(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


/**
 * Returns the HTML of a board column.
 * @param {{status: string, title: string}} column - The column data.
 * @param {string} tasksHtml - The HTML of the task cards in this column.
 * @returns {string} The column HTML.
 */
function boardColumnTemplate(column, tasksHtml) {
  return `
    <section class="boardColumn" data-status="${column.status}">
      <div class="columnHeader">
        <h2 class="columnTitle">${column.title}</h2>
        <button class="columnAddButton" type="button" onclick="openAddTaskDialog()"><img class="columnAddIcon" src="${iconPath}plus_box.svg" alt="Add task to ${column.title}"></button>
      </div>
      <div class="columnTasks">
        <p class="taskPlaceholder">No tasks ${column.title}</p>
        ${tasksHtml}
      </div>
    </section>`;
}


/**
 * Returns the HTML of a task card.
 * @param {Task} task - The task to show.
 * @returns {string} The task card HTML.
 */
function taskCardTemplate(task) {
  return `
    <article class="taskCard" data-task-id="${task.id}" draggable="true">
      <div class="taskCardHeader">
        <span class="taskCategory ${categoryClasses[task.category]}">${makeTextSafe(task.category)}</span>
        <button class="taskMoveButton" type="button" data-action="toggleMove"><img src="${iconPath}move_task.svg" alt="Move task"></button>
      </div>
      <div class="taskMoveMenu">
        <span class="taskMoveTitle">Move to</span>
        ${getMoveOptionsHtml(task.status)}
      </div>
      <div class="taskText">
        <h3 class="taskTitle">${makeTextSafe(task.title)}</h3>
        <p class="taskDescription">${makeTextSafe(task.description)}</p>
      </div>
      ${getProgressHtml(task.subtasks)}
      <div class="taskFooter">
        <div class="taskAssignees">${getAvatarsHtml(task.assignedTo, 'card')}</div>
        <img class="taskPriority" src="${iconPath}${priorities[task.priority].icon}" alt="${priorities[task.priority].label}">
      </div>
    </article>`;
}


/**
 * Returns the HTML of an option in the move menu.
 * @param {{status: string, title: string}} column - The target column.
 * @param {string} direction - "upward" or "downward".
 * @returns {string} The option HTML.
 */
function taskMoveOptionTemplate(column, direction) {
  return `<button class="taskMoveOption" type="button" data-action="moveTask" data-status="${column.status}"><img src="${iconPath}arrow_${direction}.svg" alt="">${column.title}</button>`;
}


/**
 * Returns the HTML of the subtask progress bar.
 * @param {number} doneCount - The number of done subtasks.
 * @param {number} totalCount - The total number of subtasks.
 * @returns {string} The progress HTML.
 */
function taskProgressTemplate(doneCount, totalCount) {
  return `
    <div class="taskProgress">
      <progress class="taskProgressBar" value="${doneCount}" max="${totalCount}"></progress>
      <span class="taskProgressText">${doneCount}/${totalCount} Subtasks</span>
    </div>`;
}


/**
 * Returns the HTML of an avatar on a task card.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color class of the avatar.
 * @returns {string} The avatar HTML.
 */
function taskAvatarTemplate(initials, avatarColor) {
  return `<span class="taskAvatar ${avatarColor}">${makeTextSafe(initials)}</span>`;
}


/**
 * Returns the HTML of the task detail view.
 * @param {Task} task - The task to show.
 * @returns {string} The task detail HTML.
 */
function taskDetailTemplate(task) {
  return `
    <div class="taskDetailHeader">
      <span class="taskCategory taskDetailCategory ${categoryClasses[task.category]}">${makeTextSafe(task.category)}</span>
      <button class="taskDetailClose" type="button"><img src="${iconPath}cancel.svg" alt="Close"></button>
    </div>
    <h2 class="taskDetailTitle">${makeTextSafe(task.title)}</h2>
    <p class="taskDetailDescription">${makeTextSafe(task.description)}</p>
    <div class="taskDetailRow">
      <span class="taskDetailLabel">Due date:</span>
      <span>${formatDueDate(task.dueDate)}</span>
    </div>
    <div class="taskDetailRow">
      <span class="taskDetailLabel">Priority:</span>
      <span class="taskDetailPriority">${priorities[task.priority].label}<img src="${iconPath}${priorities[task.priority].icon}" alt=""></span>
    </div>
    <div class="taskDetailSection">
      <span class="taskDetailLabel">Assigned To:</span>
      <ul class="taskDetailList">${getAvatarsHtml(task.assignedTo, 'detail')}</ul>
    </div>
    <div class="taskDetailSection">
      <span class="taskDetailLabel">Subtasks</span>
      <ul class="taskDetailList" data-task-id="${makeTextSafe(task.id)}">${getSubtasksHtml(task.subtasks)}</ul>
    </div>
    <div class="taskDetailActions">
      <button class="taskDetailAction" type="button" data-action="delete" data-task-id="${makeTextSafe(task.id)}"><img src="${iconPath}delete.svg" alt="">Delete</button>
      <button class="taskDetailAction" type="button" data-action="edit" data-task-id="${makeTextSafe(task.id)}"><img src="${iconPath}edit.svg" alt="">Edit</button>
    </div>`;
}


/**
 * Returns the HTML of an assigned contact in the task detail view.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color class of the avatar.
 * @param {string} name - The name of the contact.
 * @returns {string} The list item HTML.
 */
function taskDetailAssigneeTemplate(initials, avatarColor, name) {
  return `<li class="taskDetailAssignee"><span class="taskAvatar taskDetailAvatar ${avatarColor}">${makeTextSafe(initials)}</span><span class="taskDetailAssigneeName">${makeTextSafe(name)}</span></li>`;
}


/**
 * Returns the HTML of a subtask in the task detail view.
 * @param {string} title - The title of the subtask.
 * @param {string} checkedAttribute - "checked" if the subtask is done, otherwise an empty string.
 * @param {number} index - The position of the subtask in the subtask list.
 * @returns {string} The list item HTML.
 */
function taskDetailSubtaskTemplate(title, checkedAttribute, index) {
  return `<li><label class="taskDetailSubtask"><input class="taskDetailCheckbox" type="checkbox" data-subtask-index="${index}" ${checkedAttribute}><span class="taskDetailSubtaskTitle">${makeTextSafe(title)}</span></label></li>`;
}


/**
 * Returns the HTML of the add task form inside the dialog.
 * @returns {string} The add task form HTML.
 */
function renderAddTaskDialog() {
  return `
    <div class="add-task-dialog-header">
      <h1>Add Task</h1>
      <button class="close-dialog" onclick="closeAddTaskDialog()" type="button"><img src="../../assets/icons/cancel.svg" alt="Close"></button>
    </div>
    <form id="addTaskForm" novalidate>
      <div class="form-task-input">
        <section class="form-left">
          <div class="add-task-input-container">
            <label for="title">Title <span class="required-asterisk">*</span></label>
            <input class="add-task-input" type="text" name="title" id="title" placeholder="Enter a title" required>
          </div>
          <div class="add-task-input-container">
            <label for="description">Description</label>
            <textarea class="add-task-input" name="description" id="description" placeholder="Enter a description" required></textarea>
          </div>
          <div class="add-task-input-container">
            <label for="dueDate">Due Date <span class="required-asterisk">*</span></label>
            <input class="add-task-input add-task-date-input" type="date" name="dueDate" id="dueDate" required>
          </div>
        </section>
        <div class="seperator"></div>
        <section class="form-right">
          <div class="add-task-input-container">
            <label class="priority-label" for="priority">Priority</label>
            <div id="priority" class="priority-btn-container">
              <button type="button" class="priority-btn" id="priorityUrgent" onclick="setPriority('urgent')">Urgent <img class="priority-btn-icon" src="../../assets/icons/urgent.svg" data-icon="urgent.svg" data-active-icon="urgend-white.svg" alt="Urgent"></button>
              <button type="button" class="priority-btn btn-active priority-medium" id="priorityMedium" onclick="setPriority('medium')">Medium <img class="priority-btn-icon" src="../../assets/icons/medium.svg" data-icon="medium_orange.svg" data-active-icon="medium.svg" alt="Medium"></button>
              <button type="button" class="priority-btn" id="priorityLow" onclick="setPriority('low')">Low <img class="priority-btn-icon" src="../../assets/icons/low.svg" data-icon="low.svg" data-active-icon="urgend-white.svg" alt="Low"></button>
            </div>
          </div>
          <div class="add-task-input-container">
            <label for="assigned">Assigned To</label>
            <div class="custom-select custom-select-assigned">
              <select class="visually-hidden-select" name="assigned" id="assignedValue" required aria-hidden="true" tabindex="-1"></select>
              <button type="button" class="add-task-input custom-select-trigger" id="assigned" aria-haspopup="listbox" aria-expanded="false">Assigned To</button>
              <div class="custom-select-menu" role="listbox" aria-labelledby="assigned" hidden></div>
              <div class="custom-select-selected-contacts" role="list" aria-label="Assigned contacts" hidden></div>
            </div>
          </div>
          <div class="add-task-input-container">
            <label for="category">Category <span class="required-asterisk">*</span></label>
            <div class="custom-select">
              <select class="visually-hidden-select" name="category" id="categoryValue" required aria-hidden="true" tabindex="-1">
                <option value="" disabled selected hidden>Category</option>
                <option value="Technical Task">Technical Task</option>
                <option value="User Story">User Story</option>
              </select>
              <button type="button" class="add-task-input custom-select-trigger" id="category" aria-haspopup="listbox" aria-expanded="false">Category</button>
              <div class="custom-select-menu" role="listbox" aria-labelledby="category" hidden></div>
            </div>
          </div>
          <div class="add-task-input-container">
            <label for="subtasks">Subtasks</label>
            <input class="add-task-input" type="text" name="subtasks" id="subtasks" placeholder="Add new subtask" required>
          </div>
        </section>
      </div>
      <div class="footer">
        <p class="required"><span class="required-asterisk">*</span> Required fields</p>
        <div class="add-task-btn-container">
          <button type="button" class="clear-task-btn add-task-btn" onclick="clearTaskForm()">Clear <img src="../../assets/icons/cancel.svg" alt="Clear"></button>
          <button type="submit" class="create-task-btn add-task-btn" disabled aria-disabled="true">Create Task <img src="../../assets/icons/check.svg" alt="Create Task"></button>
        </div>
      </div>
      <p class="task-form-status" id="taskFormStatus" role="status" aria-live="polite" hidden></p>
    </form>`;
}


/**
 * Returns the HTML of the task edit form.
 * @param {Task} task - The task to edit.
 * @returns {string} The edit form HTML.
 */
function taskEditTemplate(task) {
  return `
    <form class="taskEditForm" data-task-id="${makeTextSafe(task.id)}">
      <div class="taskEditHeader">
        <button class="taskDetailClose" type="button"><img src="${iconPath}cancel.svg" alt="Close"></button>
      </div>
      <label class="taskEditField">
        <span class="taskEditLabel">Title</span>
        <input class="taskEditInput" type="text" name="title" value="${makeTextSafe(task.title)}">
        <span class="taskEditError">This field is required</span>
      </label>
      <label class="taskEditField">
        <span class="taskEditLabel">Description</span>
        <textarea class="taskEditInput taskEditTextarea" name="description">${makeTextSafe(task.description)}</textarea>
      </label>
      <label class="taskEditField">
        <span class="taskEditLabel">Due date</span>
        <input class="taskEditInput" type="date" name="dueDate" value="${makeTextSafe(task.dueDate)}">
        <span class="taskEditError">This field is required</span>
      </label>
      <fieldset class="taskEditField taskEditFieldset">
        <legend class="taskEditLabel">Priority</legend>
        <div class="taskEditPriorities">${getEditPrioritiesHtml(task.priority)}</div>
      </fieldset>
      <div class="taskEditField taskEditAssign">
        <span class="taskEditLabel">Assigned to</span>
        <button class="taskEditInput taskEditAssignToggle" type="button" data-action="toggleAssign">Select contacts to assign</button>
        <ul class="taskEditAssignList">${getEditContactsHtml(task.assignedTo)}</ul>
        <div class="taskEditAssignees">${getAvatarsHtml(task.assignedTo, 'card')}</div>
      </div>
      <div class="taskEditField">
        <span class="taskEditLabel">Subtasks</span>
        <div class="taskEditSubtaskAdd">
          <input class="taskEditInput taskEditNewSubtask" type="text" placeholder="Add new subtask" aria-label="Add new subtask">
          <button class="taskEditIconButton" type="button" data-action="addSubtask"><img src="${iconPath}plus_box.svg" alt="Add subtask"></button>
        </div>
        <ul class="taskEditSubtaskList">${getEditSubtasksHtml(task.subtasks)}</ul>
      </div>
      <div class="taskEditActions">
        <button class="taskEditSubmit" type="submit">Ok<img src="${iconPath}check.svg" alt=""></button>
      </div>
    </form>`;
}


/**
 * Returns the HTML of a priority radio button in the edit form.
 * @param {string} priority - The priority key, e.g. "urgent".
 * @param {string} checkedAttribute - "checked" if this priority is selected, otherwise an empty string.
 * @returns {string} The priority HTML.
 */
function taskEditPriorityTemplate(priority, checkedAttribute) {
  return `
    <label class="taskEditPriority ${priorities[priority].editClass}">
      <input class="taskEditPriorityRadio" type="radio" name="priority" value="${priority}" ${checkedAttribute}>
      ${priorities[priority].label}<img class="taskEditPriorityIcon" src="${iconPath}${priorities[priority].icon}" alt="">
    </label>`;
}


/**
 * Returns the HTML of a selectable contact in the edit form.
 * @param {Object} contact - The contact with id and name.
 * @param {number} index - The position of the contact in the list of the edit form.
 * @param {string} avatarColor - The color class of the avatar.
 * @param {string} checkedAttribute - "checked" if the contact is assigned, otherwise an empty string.
 * @returns {string} The list item HTML.
 */
function taskEditContactTemplate(contact, index, avatarColor, checkedAttribute) {
  return `
    <li>
      <label class="taskEditContact">
        <span class="taskAvatar ${avatarColor}">${makeTextSafe(getInitials(contact.name))}</span>
        <span class="taskEditContactName">${makeTextSafe(contact.name)}</span>
        <input class="taskEditContactCheckbox" type="checkbox" value="${index}" ${checkedAttribute}>
      </label>
    </li>`;
}


/**
 * Returns the HTML of an editable subtask in the edit form.
 * @param {Subtask} subtask - The subtask to show.
 * @returns {string} The list item HTML.
 */
function taskEditSubtaskTemplate(subtask) {
  return `
    <li class="taskEditSubtask" data-done="${subtask.done}">
      <input class="taskEditInput taskEditSubtaskInput" type="text" value="${makeTextSafe(subtask.title)}" aria-label="Subtask">
      <button class="taskEditIconButton" type="button" data-action="removeSubtask"><img src="${iconPath}delete.svg" alt="Remove subtask"></button>
    </li>`;
}
