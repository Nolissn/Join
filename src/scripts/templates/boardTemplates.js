function makeTextSafe(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function boardColumnTemplate(column, tasksHtml) {
  return `
    <section class="boardColumn" data-status="${column.status}">
      <div class="columnHeader">
        <h2 class="columnTitle">${column.title}</h2>
        <button class="columnAddButton" type="button"><img class="columnAddIcon" src="${iconPath}plus_box.svg" alt="Add task to ${column.title}"></button>
      </div>
      <div class="columnTasks">
        <p class="taskPlaceholder">No tasks ${column.title}</p>
        ${tasksHtml}
      </div>
    </section>`;
}

function taskCardTemplate(task) {
  return `
    <article class="taskCard" data-task-id="${task.id}" draggable="true">
      <span class="taskCategory ${categoryClasses[task.category]}">${makeTextSafe(task.category)}</span>
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

function taskProgressTemplate(doneCount, totalCount) {
  return `
    <div class="taskProgress">
      <progress class="taskProgressBar" value="${doneCount}" max="${totalCount}"></progress>
      <span class="taskProgressText">${doneCount}/${totalCount} Subtasks</span>
    </div>`;
}

function taskAvatarTemplate(initials, avatarColor) {
  return `<span class="taskAvatar ${avatarColor}">${makeTextSafe(initials)}</span>`;
}

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
      <ul class="taskDetailList">${getSubtasksHtml(task.subtasks)}</ul>
    </div>
    <div class="taskDetailActions">
      <button class="taskDetailAction" type="button"><img src="${iconPath}delete.svg" alt="">Delete</button>
      <button class="taskDetailAction" type="button"><img src="${iconPath}edit.svg" alt="">Edit</button>
    </div>`;
}

function taskDetailAssigneeTemplate(initials, avatarColor, name) {
  return `<li class="taskDetailAssignee"><span class="taskAvatar taskDetailAvatar ${avatarColor}">${makeTextSafe(initials)}</span>${makeTextSafe(name)}</li>`;
}

function taskDetailSubtaskTemplate(title, checkedAttribute) {
  return `<li><label class="taskDetailSubtask"><input class="taskDetailCheckbox" type="checkbox" ${checkedAttribute}>${makeTextSafe(title)}</label></li>`;
}


function renderAddTaskDialog() {
  return `
    <div class="add-task-dialog-header">
      <h1>Add Task</h1>
      <button class="close-dialog" onclick="closeAddTaskDialog()" type="button"><img src="../../assets/icons/cancel.svg" alt="Close"></button>
    </div>
    <form id="addTaskForm">
      <div class="form-task-input">
        <section class="form-left">
          <div class="add-task-input-container">
            <label for="title">Title</label>
            <input class="add-task-input" type="text" name="title" id="title" placeholder="Enter a title" required>
          </div>
          <div class="add-task-input-container">
            <label for="description">Description</label>
            <textarea class="add-task-input" name="description" id="description" placeholder="Enter a description" required></textarea>
          </div>
          <div class="add-task-input-container">
            <label for="dueDate">Due Date</label>
            <input class="add-task-input" type="date" name="dueDate" id="dueDate" style="color:var(--colorTextGrey)" required>
          </div>
        </section>
        <div class="seperator"></div>
        <section class="form-right">
          <div class="add-task-input-container">
            <label for="priority" style="color:var(--colorBlack)">Priority</label>
            <div id="priority" class="priority-btn-container">
              <button type="button" class="priority-btn" id="priorityUrgent" onclick="setPriority('urgent')">Urgent <img class="priority-btn-icon" src="../../assets/icons/urgent.svg" data-icon="urgent.svg" data-active-icon="urgend-white.svg" alt="Urgent"></button>
              <button type="button" class="priority-btn btn-active priority-medium" id="priorityMedium" onclick="setPriority('medium')">Medium <img class="priority-btn-icon" src="../../assets/icons/medium.svg" data-icon="medium_orange.svg" data-active-icon="medium.svg" alt="Medium"></button>
              <button type="button" class="priority-btn" id="priorityLow" onclick="setPriority('low')">Low <img class="priority-btn-icon" src="../../assets/icons/low.svg" data-icon="low.svg" data-active-icon="urgend-white.svg" alt="Low"></button>
            </div>
          </div>
          <div class="add-task-input-container">
            <label for="assigned">Assigned To</label>
            <div class="custom-select">
              <select class="visually-hidden-select" name="assigned" id="assignedValue" required aria-hidden="true" tabindex="-1">
                <option value="" disabled selected hidden>Assigned To</option>
                <option value="user1">User 1</option>
                <option value="user2">User 2</option>
                <option value="user3">User 3</option>
              </select>
              <button type="button" class="add-task-input custom-select-trigger" id="assigned" aria-haspopup="listbox" aria-expanded="false">Assigned To</button>
              <div class="custom-select-menu" role="listbox" aria-labelledby="assigned" hidden></div>
            </div>
          </div>
          <div class="add-task-input-container">
            <label for="category">Category</label>
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
          <button type="submit" class="create-task-btn add-task-btn" disabled>Create Task <img src="../../assets/icons/check.svg" alt="Create Task"></button>
        </div>
      </div>
      <p class="task-form-status" id="taskFormStatus" role="status" aria-live="polite" hidden></p>
    </form>`;
}