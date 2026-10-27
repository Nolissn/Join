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
      <button class="taskDetailAction" type="button" data-action="delete" data-task-id="${makeTextSafe(task.id)}"><img src="${iconPath}delete.svg" alt="">Delete</button>
      <button class="taskDetailAction" type="button" data-action="edit" data-task-id="${makeTextSafe(task.id)}"><img src="${iconPath}edit.svg" alt="">Edit</button>
    </div>`;
}

function taskDetailAssigneeTemplate(initials, avatarColor, name) {
  return `<li class="taskDetailAssignee"><span class="taskAvatar taskDetailAvatar ${avatarColor}">${makeTextSafe(initials)}</span>${makeTextSafe(name)}</li>`;
}

function taskDetailSubtaskTemplate(title, checkedAttribute) {
  return `<li><label class="taskDetailSubtask"><input class="taskDetailCheckbox" type="checkbox" ${checkedAttribute}>${makeTextSafe(title)}</label></li>`;
}

function taskEditTemplate(task) {
  return `
    <form class="taskEditForm" data-task-id="${makeTextSafe(task.id)}">
      <div class="taskEditHeader">
        <button class="taskDetailClose" type="button"><img src="${iconPath}cancel.svg" alt="Close"></button>
      </div>
      <label class="taskEditField">
        <span class="taskEditLabel">Title</span>
        <input class="taskEditInput" type="text" name="title" value="${makeTextSafe(task.title)}" pattern=".*\\S.*" required>
      </label>
      <label class="taskEditField">
        <span class="taskEditLabel">Description</span>
        <textarea class="taskEditInput taskEditTextarea" name="description" required>${makeTextSafe(task.description)}</textarea>
      </label>
      <label class="taskEditField">
        <span class="taskEditLabel">Due date</span>
        <input class="taskEditInput" type="date" name="dueDate" value="${makeTextSafe(task.dueDate)}" required>
      </label>
      <fieldset class="taskEditField taskEditFieldset">
        <legend class="taskEditLabel">Priority</legend>
        <div class="taskEditPriorities">${getEditPrioritiesHtml(task.priority)}</div>
      </fieldset>
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

function taskEditPriorityTemplate(priority, checkedAttribute) {
  return `
    <label class="taskEditPriority ${priorities[priority].editClass}">
      <input class="taskEditPriorityRadio" type="radio" name="priority" value="${priority}" required ${checkedAttribute}>
      ${priorities[priority].label}<img class="taskEditPriorityIcon" src="${iconPath}${priorities[priority].icon}" alt="">
    </label>`;
}

function taskEditSubtaskTemplate(subtask) {
  return `
    <li class="taskEditSubtask" data-done="${subtask.done}">
      <input class="taskEditInput taskEditSubtaskInput" type="text" value="${makeTextSafe(subtask.title)}" aria-label="Subtask">
      <button class="taskEditIconButton" type="button" data-action="removeSubtask"><img src="${iconPath}delete.svg" alt="Remove subtask"></button>
    </li>`;
}
