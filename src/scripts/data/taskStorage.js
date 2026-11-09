const waitingTaskIds = [];
let storedTasks = [];
let firebaseQueue = Promise.resolve();


/**
 * Reads the cached tasks from the session storage.
 * @returns {Task[]|null} The cached tasks, or null if nothing is saved or reading fails.
 */
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


/**
 * Saves the stored tasks in the session storage.
 */
function saveTasksToSessionStorage() {
  try {
    sessionStorage.setItem(tasksKey, JSON.stringify(storedTasks));
  } catch (error) {
    console.warn('Tasks could not be saved:', error);
  }
}


/**
 * Loads the tasks from the session storage, or from Firebase if the cache is missing or outdated.
 * @returns {Promise<void>}
 */
async function loadTasks() {
  const savedTasks = readSessionTasks();
  if (Array.isArray(savedTasks) && !areTasksOutdated()) {
    storedTasks = savedTasks;
    return;
  }
  await loadTasksFromFirebase();
}


/**
 * Loads the tasks from Firebase and refreshes the session storage.
 * Falls back to the cached tasks if loading fails.
 * @returns {Promise<void>}
 */
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


/**
 * Checks whether the cached tasks are marked as outdated.
 * @returns {boolean} True if the tasks are outdated or the session storage is not available.
 */
function areTasksOutdated() {
  try {
    return sessionStorage.getItem(tasksOutdatedKey) === 'true';
  } catch (error) {
    return true;
  }
}


/**
 * Returns the cached tasks from the session storage.
 * @returns {Task[]} The cached tasks, or an empty array if there are none.
 */
function readStoredTasks() {
  const savedTasks = readSessionTasks();
  if (Array.isArray(savedTasks)) return savedTasks;
  return [];
}


/**
 * Finds a stored task by its id.
 * @param {string} taskId - The id of the task.
 * @returns {Task|undefined} The matching task, or undefined if no task is found.
 */
function findStoredTask(taskId) {
  for (const task of storedTasks) {
    if (task.id === taskId) return task;
  }
}


/**
 * Saves the changes of a task in the session storage and queues the upload to Firebase.
 * A task that is already waiting in the queue is not added twice.
 * @param {string} taskId - The id of the changed task.
 */
function saveTaskChanges(taskId) {
  saveTasksToSessionStorage();
  if (waitingTaskIds.includes(taskId)) return;
  waitingTaskIds.push(taskId);
  firebaseQueue = firebaseQueue.then(function () {
    return sendTaskToFirebase(taskId);
  });
}


/**
 * Sends the current state of a stored task to Firebase.
 * @param {string} taskId - The id of the task to send.
 * @returns {Promise<void>}
 */
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


/**
 * Removes a task from the stored tasks and queues its deletion in Firebase.
 * @param {string} taskId - The id of the task to delete.
 */
function deleteStoredTask(taskId) {
  storedTasks = storedTasks.filter(function (task) {
    return task.id !== taskId;
  });
  saveTasksToSessionStorage();
  firebaseQueue = firebaseQueue.then(function () {
    return deleteTaskFromFirebase(taskId);
  });
}


/**
 * Deletes a task in Firebase.
 * @param {string} taskId - The id of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTaskFromFirebase(taskId) {
  try {
    const joinDbApi = await import('./joinDbApi.js');
    await joinDbApi.deleteTask(taskId);
  } catch (error) {
    console.warn('Task ' + taskId + ' could not be deleted from Firebase:', error);
  }
}
