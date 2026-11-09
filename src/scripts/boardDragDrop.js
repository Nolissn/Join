const autoScrollZone = 80;
const autoScrollMaxSpeed = 18;
let mouseDrag = null;


/**
 * Starts dragging a task card with the mouse and starts the auto scroll.
 * Mouse dragging is blocked while a touch sort is active.
 * @param {DragEvent} event - The dragstart event.
 */
function startDragging(event) {
  const taskCard = event.target.closest('.taskCard');
  if (!taskCard) return;
  if (touchSort) return event.preventDefault();
  event.dataTransfer.setData('text/plain', taskCard.dataset.taskId);
  mouseDrag = { card: taskCard, pointerX: event.clientX, pointerY: event.clientY };
  mouseDrag.frameId = requestAnimationFrame(autoScrollWhileDragging);
  setTimeout(function () {
    taskCard.classList.add('taskCardDragging');
  });
}


/**
 * Updates the pointer position while dragging and places the card in the column below the pointer.
 * @param {DragEvent} event - The dragover event.
 */
function handleDragOver(event) {
  if (!mouseDrag) return;
  event.preventDefault();
  mouseDrag.pointerX = event.clientX;
  mouseDrag.pointerY = event.clientY;
  const column = event.target.closest('.boardColumn');
  if (!column) return;
  placeCardAtPointer(column.querySelector('.columnTasks'), mouseDrag.card, event.clientX, event.clientY);
}


/**
 * Drops the dragged card and saves its new status and the new order of the column.
 * @param {DragEvent} event - The drop event.
 */
function moveTask(event) {
  if (!mouseDrag) return;
  event.preventDefault();
  const columnTasks = mouseDrag.card.closest('.columnTasks');
  const newStatus = columnTasks.closest('.boardColumn').dataset.status;
  const task = findStoredTask(mouseDrag.card.dataset.taskId);
  if (task.status !== newStatus) {
    task.status = newStatus;
    saveTaskChanges(task.id);
  }
  saveColumnOrder(columnTasks);
  endDragging();
}


/**
 * Scrolls the page and, in row layout, the column when the pointer is near an edge.
 * Runs on every animation frame while a card is dragged.
 */
function autoScrollWhileDragging() {
  const columnTasks = mouseDrag.card.closest('.columnTasks');
  const columnRect = columnTasks.getBoundingClientRect();
  const scrollDown = getScrollStep(mouseDrag.pointerY, 0, window.innerHeight);
  window.scrollBy({ top: scrollDown, behavior: 'instant' });
  if (isRowLayout(columnTasks)) {
    const scrollRight = getScrollStep(mouseDrag.pointerX, columnRect.left, columnRect.right);
    columnTasks.scrollBy({ left: scrollRight, behavior: 'instant' });
  }
  placeCardAtPointer(columnTasks, mouseDrag.card, mouseDrag.pointerX, mouseDrag.pointerY);
  mouseDrag.frameId = requestAnimationFrame(autoScrollWhileDragging);
}


/**
 * Calculates the scroll step for a pointer near the start or the end of an area.
 * @param {number} pointer - The pointer position in pixels.
 * @param {number} areaStart - The start of the area in pixels.
 * @param {number} areaEnd - The end of the area in pixels.
 * @returns {number} A negative step towards the start, a positive step towards the end, or 0.
 */
function getScrollStep(pointer, areaStart, areaEnd) {
  if (pointer - areaStart < autoScrollZone) return -getEdgeSpeed(pointer - areaStart);
  if (areaEnd - pointer < autoScrollZone) return getEdgeSpeed(areaEnd - pointer);
  return 0;
}


/**
 * Calculates the scroll speed. The closer the pointer is to the edge, the faster it scrolls.
 * @param {number} distance - The distance between the pointer and the edge in pixels.
 * @returns {number} The scroll speed in pixels per frame.
 */
function getEdgeSpeed(distance) {
  const closeness = 1 - Math.max(distance, 0) / autoScrollZone;
  return Math.ceil(closeness * closeness * autoScrollMaxSpeed);
}


/**
 * Stops the auto scroll, resets the drag state and renders the board again.
 */
function endDragging() {
  if (mouseDrag) cancelAnimationFrame(mouseDrag.frameId);
  mouseDrag = null;
  renderBoard();
}


/**
 * Checks whether the tasks of a column are laid out in a row.
 * @param {HTMLElement} columnTasks - The task container of a column.
 * @returns {boolean} True if the flex direction is row.
 */
function isRowLayout(columnTasks) {
  return getComputedStyle(columnTasks).flexDirection === 'row';
}


/**
 * Moves a card in front of the first card that lies after the pointer, or to the end of the column.
 * @param {HTMLElement} columnTasks - The task container of the column.
 * @param {HTMLElement} movingCard - The card that is moved.
 * @param {number} pointerX - The horizontal pointer position in pixels.
 * @param {number} pointerY - The vertical pointer position in pixels.
 */
function placeCardAtPointer(columnTasks, movingCard, pointerX, pointerY) {
  const isRow = isRowLayout(columnTasks);
  for (const card of columnTasks.querySelectorAll('.taskCard')) {
    if (card === movingCard) continue;
    if (isPointerBeforeCard(card, isRow, pointerX, pointerY)) {
      if (card.previousElementSibling !== movingCard) columnTasks.insertBefore(movingCard, card);
      return;
    }
  }
  if (columnTasks.lastElementChild !== movingCard) columnTasks.appendChild(movingCard);
}


/**
 * Checks whether the pointer lies before the middle of a card.
 * @param {HTMLElement} card - The card to compare with.
 * @param {boolean} isRow - Whether the column is laid out in a row.
 * @param {number} pointerX - The horizontal pointer position in pixels.
 * @param {number} pointerY - The vertical pointer position in pixels.
 * @returns {boolean} True if the pointer lies before the middle of the card.
 */
function isPointerBeforeCard(card, isRow, pointerX, pointerY) {
  const cardRect = card.getBoundingClientRect();
  if (isRow) return pointerX < cardRect.left + cardRect.width / 2;
  return pointerY < cardRect.top + cardRect.height / 2;
}


/**
 * Saves the order of the cards in a column and uploads every task whose order has changed.
 * @param {HTMLElement} columnTasks - The task container of the column.
 */
function saveColumnOrder(columnTasks) {
  const status = columnTasks.closest('.boardColumn').dataset.status;
  const columnOrder = getNewColumnOrder(status, getCardIds(columnTasks));
  for (let i = 0; i < columnOrder.length; i++) {
    if (columnOrder[i].order === i) continue;
    columnOrder[i].order = i;
    saveTaskChanges(columnOrder[i].id);
  }
}


/**
 * Returns the task ids of all cards in a column in their visible order.
 * @param {HTMLElement} columnTasks - The task container of the column.
 * @returns {string[]} The task ids.
 */
function getCardIds(columnTasks) {
  const cardIds = [];
  for (const card of columnTasks.querySelectorAll('.taskCard')) {
    cardIds.push(card.dataset.taskId);
  }
  return cardIds;
}


/**
 * Builds the new order of all tasks in a column.
 * Visible tasks take the order of the cards, hidden tasks keep their position.
 * @param {string} status - The status of the column.
 * @param {string[]} visibleIds - The ids of the visible cards in their order.
 * @returns {Task[]} The tasks of the column in their new order.
 */
function getNewColumnOrder(status, visibleIds) {
  const remainingIds = visibleIds.slice();
  const columnOrder = [];
  for (const task of getSortedTasks()) {
    if (task.status !== status) continue;
    if (visibleIds.includes(task.id)) columnOrder.push(findStoredTask(remainingIds.shift()));
    else columnOrder.push(task);
  }
  return columnOrder;
}
