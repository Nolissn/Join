const touchHoldDelay = 500;
const touchMoveTolerance = 8;
let touchSort = null;

function initTouchSortEvents(boardElement) {
  boardElement.addEventListener('touchstart', startTouchHold, { passive: true });
  boardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  boardElement.addEventListener('touchend', endTouchSort);
  boardElement.addEventListener('touchcancel', endTouchSort);
  boardElement.addEventListener('contextmenu', preventMenuWhileHolding);
}

function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}

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

function canVibrate() {
  if (!navigator.vibrate || !navigator.userActivation) return false;
  return navigator.userActivation.hasBeenActive;
}

function createDragGhost(card) {
  const ghost = card.cloneNode(true);
  ghost.classList.add('taskCardGhost');
  document.body.appendChild(ghost);
  return ghost;
}

function moveDragGhost(touchX, touchY) {
  touchSort.ghost.style.setProperty('--dragX', (touchX - touchSort.offsetX) + 'px');
  touchSort.ghost.style.setProperty('--dragY', (touchY - touchSort.offsetY) + 'px');
}

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

function cancelHoldIfMoved() {
  const movedX = Math.abs(touchSort.touchX - touchSort.startX);
  const movedY = Math.abs(touchSort.touchY - touchSort.startY);
  if (movedX > touchMoveTolerance || movedY > touchMoveTolerance) {
    clearTimeout(touchSort.holdTimer);
    touchSort = null;
  }
}

function placeTouchCard() {
  placeCardAtPointer(touchSort.columnTasks, touchSort.card, touchSort.touchX, touchSort.touchY);
}

function autoScrollColumn() {
  const columnRect = touchSort.columnTasks.getBoundingClientRect();
  const scrollRight = getScrollStep(touchSort.touchX, columnRect.left, columnRect.right);
  if (scrollRight !== 0) {
    touchSort.columnTasks.scrollBy({ left: scrollRight, behavior: 'instant' });
    placeTouchCard();
  }
  touchSort.frameId = requestAnimationFrame(autoScrollColumn);
}

function endTouchSort(event) {
  if (!touchSort) return;
  clearTimeout(touchSort.holdTimer);
  if (touchSort.isGrabbed) dropHeldCard(event);
  touchSort = null;
}

function dropHeldCard(event) {
  event.preventDefault();
  cancelAnimationFrame(touchSort.frameId);
  touchSort.ghost.remove();
  touchSort.card.classList.remove('taskCardHeld');
  saveColumnOrder(touchSort.columnTasks);
}

function preventMenuWhileHolding(event) {
  if (touchSort) event.preventDefault();
}
