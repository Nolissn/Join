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
