const touchHoldDelay = 500;
const touchMoveTolerance = 8;
let touchSort = null;


/**
 * Registers the touch event listeners for sorting task cards on mobile devices.
 * @param {HTMLElement} boardElement - The board container.
 */
function initTouchSortEvents(boardElement) {
  boardElement.addEventListener('touchstart', startTouchHold, { passive: true });
  boardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  boardElement.addEventListener('touchend', endTouchSort);
  boardElement.addEventListener('touchcancel', endTouchSort);
  boardElement.addEventListener('contextmenu', preventMenuWhileHolding);
}


/**
 * Checks whether the board is shown in the mobile view.
 * @returns {boolean} True if the viewport is 768px wide or less.
 */
function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}


/**
 * Starts the hold timer when a task card is touched in the mobile view.
 * Touches on buttons and on the move menu are ignored.
 * @param {TouchEvent} event - The touchstart event.
 */
function startTouchHold(event) {
  const card = event.target.closest('.taskCard');
  if (!card || event.touches.length > 1 || !isMobileView()) return;
  if (event.target.closest('[data-action], .taskMoveMenu')) return;
  const touch = event.touches[0];
  touchSort = { card: card, isGrabbed: false, startX: touch.clientX, startY: touch.clientY };
  touchSort.touchX = touch.clientX;
  touchSort.touchY = touch.clientY;
  touchSort.holdTimer = setTimeout(grabTaskCard, touchHoldDelay);
}


/**
 * Grabs the touched card after the hold delay.
 * Creates the drag ghost, starts the auto scroll and vibrates if possible.
 */
function grabTaskCard() {
  const card = touchSort.card;
  const cardRect = card.getBoundingClientRect();
  closeMoveMenus();
  touchSort.isGrabbed = true;
  touchSort.columnTasks = card.closest('.columnTasks');
  touchSort.offsetX = touchSort.touchX - cardRect.left;
  touchSort.offsetY = touchSort.touchY - cardRect.top;
  touchSort.ghost = createDragGhost(card);
  card.classList.add('taskCardHeld');
  moveDragGhost(touchSort.touchX, touchSort.touchY);
  touchSort.frameId = requestAnimationFrame(autoScrollColumn);
  if (canVibrate()) navigator.vibrate(30);
}


/**
 * Checks whether the device can vibrate and the user has already interacted with the page.
 * @returns {boolean} True if a vibration is allowed.
 */
function canVibrate() {
  if (!navigator.vibrate || !navigator.userActivation) return false;
  return navigator.userActivation.hasBeenActive;
}


/**
 * Creates a copy of the card that follows the finger while dragging.
 * @param {HTMLElement} card - The grabbed task card.
 * @returns {HTMLElement} The drag ghost.
 */
function createDragGhost(card) {
  const ghost = card.cloneNode(true);
  ghost.classList.add('taskCardGhost');
  document.body.appendChild(ghost);
  return ghost;
}


/**
 * Moves the drag ghost to the touch position.
 * @param {number} touchX - The horizontal touch position in pixels.
 * @param {number} touchY - The vertical touch position in pixels.
 */
function moveDragGhost(touchX, touchY) {
  touchSort.ghost.style.setProperty('--dragX', (touchX - touchSort.offsetX) + 'px');
  touchSort.ghost.style.setProperty('--dragY', (touchY - touchSort.offsetY) + 'px');
}


/**
 * Moves the grabbed card with the finger.
 * Before the card is grabbed, the hold is cancelled if the finger moves too far.
 * @param {TouchEvent} event - The touchmove event.
 */
function handleTouchMove(event) {
  if (!touchSort) return;
  const touch = event.touches[0];
  touchSort.touchX = touch.clientX;
  touchSort.touchY = touch.clientY;
  if (!touchSort.isGrabbed) return cancelHoldIfMoved();
  event.preventDefault();
  moveDragGhost(touch.clientX, touch.clientY);
  placeTouchCard();
}


/**
 * Cancels the hold timer if the finger moved further than the tolerance.
 */
function cancelHoldIfMoved() {
  const movedX = Math.abs(touchSort.touchX - touchSort.startX);
  const movedY = Math.abs(touchSort.touchY - touchSort.startY);
  if (movedX > touchMoveTolerance || movedY > touchMoveTolerance) {
    clearTimeout(touchSort.holdTimer);
    touchSort = null;
  }
}


/**
 * Places the grabbed card at the current touch position.
 */
function placeTouchCard() {
  placeCardAtPointer(touchSort.columnTasks, touchSort.card, touchSort.touchX, touchSort.touchY);
}


/**
 * Scrolls the column horizontally when the finger is near its edge.
 * Runs on every animation frame while a card is grabbed.
 */
function autoScrollColumn() {
  const columnRect = touchSort.columnTasks.getBoundingClientRect();
  const scrollRight = getScrollStep(touchSort.touchX, columnRect.left, columnRect.right);
  if (scrollRight !== 0) {
    touchSort.columnTasks.scrollBy({ left: scrollRight, behavior: 'instant' });
    placeTouchCard();
  }
  touchSort.frameId = requestAnimationFrame(autoScrollColumn);
}


/**
 * Ends the touch sort and drops the card if it was grabbed.
 * @param {TouchEvent} event - The touchend or touchcancel event.
 */
function endTouchSort(event) {
  if (!touchSort) return;
  clearTimeout(touchSort.holdTimer);
  if (touchSort.isGrabbed) dropHeldCard(event);
  touchSort = null;
}


/**
 * Drops the grabbed card, removes the drag ghost and saves the new column order.
 * @param {TouchEvent} event - The touchend or touchcancel event.
 */
function dropHeldCard(event) {
  event.preventDefault();
  cancelAnimationFrame(touchSort.frameId);
  touchSort.ghost.remove();
  touchSort.card.classList.remove('taskCardHeld');
  saveColumnOrder(touchSort.columnTasks);
}


/**
 * Prevents the context menu while a card is held.
 * @param {Event} event - The contextmenu event.
 */
function preventMenuWhileHolding(event) {
  if (touchSort) event.preventDefault();
}
