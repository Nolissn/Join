const localStorageKey = 'joinData';
const outdatedKey = 'joinTasksOutdated';
const waitingTaskIds = [];
let storedTasks = [];
let firebaseQueue = Promise.resolve();

function readLocalStorage() {
  try {
    const savedText = localStorage.getItem(localStorageKey);
    if (savedText === null) return {};
    return JSON.parse(savedText);
  } catch (error) {
    console.warn('Local Storage could not be read:', error);
    return {};
  }
}

function writeLocalStorage(joinData) {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(joinData));
  } catch (error) {
    console.warn('Local Storage could not be written:', error);
  }
}

function readTasksByUser(joinData) {
  if (!joinData.tasksByUser) return {};
  return joinData.tasksByUser;
}

function saveTasksToLocalStorage() {
  const joinData = readLocalStorage();
  joinData.tasksByUser = readTasksByUser(joinData);
  joinData.tasksByUser[currentUser.id] = storedTasks;
  writeLocalStorage(joinData);
}

function removeAllCachedTasks() {
  const joinData = readLocalStorage();
  joinData.tasksByUser = {};
  writeLocalStorage(joinData);
}

async function loadTasks() {
  const tasksByUser = readTasksByUser(readLocalStorage());
  if (Array.isArray(tasksByUser[currentUser.id]) && !areTasksOutdated()) {
    storedTasks = tasksByUser[currentUser.id];
    return;
  }
  await loadTasksFromFirebase();
}

async function loadTasksFromFirebase() {
  try {
    const joinDbApi = await import('./joinDbApi.js');
    storedTasks = await joinDbApi.getTasks();
    if (areTasksOutdated()) removeAllCachedTasks();
    saveTasksToLocalStorage();
    localStorage.removeItem(outdatedKey);
  } catch (error) {
    console.warn('Tasks could not be loaded from Firebase:', error);
    storedTasks = readStoredTasks();
  }
}

function areTasksOutdated() {
  try {
    return localStorage.getItem(outdatedKey) === 'true';
  } catch (error) {
    return true;
  }
}

function readStoredTasks() {
  const tasksByUser = readTasksByUser(readLocalStorage());
  if (Array.isArray(tasksByUser[currentUser.id])) return tasksByUser[currentUser.id];
  return [];
}

function findStoredTask(taskId) {
  for (const task of storedTasks) {
    if (task.id === taskId) return task;
  }
}

function saveTaskChanges(taskId) {
  saveTasksToLocalStorage();
  if (waitingTaskIds.includes(taskId)) return;
  waitingTaskIds.push(taskId);
  firebaseQueue = firebaseQueue.then(function () {
    return sendTaskToFirebase(taskId);
  });
}

async function sendTaskToFirebase(taskId) {
  waitingTaskIds.splice(waitingTaskIds.indexOf(taskId), 1);
  const taskData = JSON.parse(JSON.stringify(findStoredTask(taskId)));
  delete taskData.id;
  try {
    const joinDbApi = await import('./joinDbApi.js');
    await joinDbApi.updateTask(taskId, taskData);
  } catch (error) {
    console.warn('Task ' + taskId + ' could not be sent to Firebase:', error);
  }
}
