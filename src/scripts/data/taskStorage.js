const waitingTaskIds = [];
let storedTasks = [];
let firebaseQueue = Promise.resolve();

function readSessionTasks() {
  try {
    const savedText = sessionStorage.getItem(tasksKey);
    if (savedText === null) return null;
    return JSON.parse(savedText);
  } catch (error) {
    console.warn('Tasks could not be read:', error);
    return null;
  }
}

function saveTasksToSessionStorage() {
  try {
    sessionStorage.setItem(tasksKey, JSON.stringify(storedTasks));
  } catch (error) {
    console.warn('Tasks could not be saved:', error);
  }
}

async function loadTasks() {
  const savedTasks = readSessionTasks();
  if (Array.isArray(savedTasks) && !areTasksOutdated()) {
    storedTasks = savedTasks;
    return;
  }
  await loadTasksFromFirebase();
}

async function loadTasksFromFirebase() {
  try {
    const joinDbApi = await import('./joinDbApi.js');
    storedTasks = await joinDbApi.getTasks();
    saveTasksToSessionStorage();
    sessionStorage.removeItem(tasksOutdatedKey);
  } catch (error) {
    console.warn('Tasks could not be loaded from Firebase:', error);
    storedTasks = readStoredTasks();
  }
}

function areTasksOutdated() {
  try {
    return sessionStorage.getItem(tasksOutdatedKey) === 'true';
  } catch (error) {
    return true;
  }
}

function readStoredTasks() {
  const savedTasks = readSessionTasks();
  if (Array.isArray(savedTasks)) return savedTasks;
  return [];
}

function findStoredTask(taskId) {
  for (const task of storedTasks) {
    if (task.id === taskId) return task;
  }
}

function saveTaskChanges(taskId) {
  saveTasksToSessionStorage();
  if (waitingTaskIds.includes(taskId)) return;
  waitingTaskIds.push(taskId);
  firebaseQueue = firebaseQueue.then(function () {
    return sendTaskToFirebase(taskId);
  });
}

async function sendTaskToFirebase(taskId) {
  waitingTaskIds.splice(waitingTaskIds.indexOf(taskId), 1);
  const task = findStoredTask(taskId);
  if (!task) return;
  const taskData = JSON.parse(JSON.stringify(task));
  delete taskData.id;
  try {
    const joinDbApi = await import('./joinDbApi.js');
    await joinDbApi.updateTask(taskId, taskData);
  } catch (error) {
    console.warn('Task ' + taskId + ' could not be sent to Firebase:', error);
  }
}

function deleteStoredTask(taskId) {
  storedTasks = storedTasks.filter(function (task) {
    return task.id !== taskId;
  });
  saveTasksToSessionStorage();
  firebaseQueue = firebaseQueue.then(function () {
    return deleteTaskFromFirebase(taskId);
  });
}

async function deleteTaskFromFirebase(taskId) {
  try {
    const joinDbApi = await import('./joinDbApi.js');
    await joinDbApi.deleteTask(taskId);
  } catch (error) {
    console.warn('Task ' + taskId + ' could not be deleted from Firebase:', error);
  }
}
