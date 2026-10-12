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

function saveTasksToLocalStorage() {
  const joinData = readLocalStorage();
  joinData.tasks = storedTasks;
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(joinData));
  } catch (error) {
    console.warn('Local Storage could not be written:', error);
  }
}

async function loadTasks() {
  const joinData = readLocalStorage();
  if (Array.isArray(joinData.tasks) && !areTasksOutdated()) {
    storedTasks = joinData.tasks;
    return;
  }
  await loadTasksFromFirebase();
}

async function loadTasksFromFirebase() {
  try {
    const joinDbApi = await import('./joinDbApi.js');
    storedTasks = await joinDbApi.getTasks();
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
  const joinData = readLocalStorage();
  if (Array.isArray(joinData.tasks)) return joinData.tasks;
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
