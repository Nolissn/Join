/**
 * Returns the HTML of a subtask in the subtask list of the add task form.
 * @param {string} title - The title of the subtask.
 * @param {number} index - The position of the subtask in the list.
 * @returns {string} The subtask HTML.
 */
function subtaskItemTemplate(title, index) {
  return `
    <li class="subtask-item" data-index="${index}">
      <span class="subtask-title">${makeTextSafe(title)}</span>
      <div class="subtask-actions">
        <button class="subtask-icon-btn" type="button" data-subtask-action="edit" aria-label="Edit subtask"><img src="${iconPath}edit.svg" alt=""></button>
        <span class="subtask-divider"></span>
        <button class="subtask-icon-btn" type="button" data-subtask-action="delete" aria-label="Delete subtask"><img src="${iconPath}delete.svg" alt=""></button>
      </div>
    </li>`;
}


/**
 * Returns the HTML of a subtask in edit mode in the subtask list of the add task form.
 * @param {string} title - The current title of the subtask.
 * @param {number} index - The position of the subtask in the list.
 * @returns {string} The subtask HTML in edit mode.
 */
function subtaskEditTemplate(title, index) {
  return `
    <li class="subtask-item subtask-item-editing" data-index="${index}">
      <input class="subtask-edit-input" type="text" value="${makeTextSafe(title)}" aria-label="Edit subtask">
      <div class="subtask-actions">
        <button class="subtask-icon-btn" type="button" data-subtask-action="delete" aria-label="Delete subtask"><img src="${iconPath}delete.svg" alt=""></button>
        <span class="subtask-divider"></span>
        <button class="subtask-icon-btn" type="button" data-subtask-action="save" aria-label="Save subtask"><img src="${iconPath}check_dark.svg" alt=""></button>
      </div>
    </li>`;
}
