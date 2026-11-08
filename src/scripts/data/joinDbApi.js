import { db } from "./joinDbConfig.js";
import { tutorialTask } from "./tutorialTask.js";
import { doc, setDoc, collection, getDocs, deleteDoc, query, where, limit } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/**
 * Returns the Firestore collection that holds the tasks of the logged-in user.
 * @returns {CollectionReference} The tasks collection of the current user.
 * @throws {Error} If no user is logged in.
 */
function getTasksCollection() {
    if (typeof currentUser === "undefined" || currentUser === null) {
        throw new Error("No user is logged in");
    }
    return collection(db, "users", currentUser.id, "tasks");
}

/**
 * Saves a new task in Firestore and marks the cached tasks as outdated.
 * The task must not contain undefined values, because Firestore does not accept them.
 * @param {Task} taskModell - The task data to save.
 * @returns {Promise<string>} The id of the created task.
 * @throws {Error} If saving fails or no user is logged in.
 */
export async function saveTask(taskModell) {
    try {
        const ref = doc(getTasksCollection());
        await setDoc(ref, taskModell);
        markTasksOutdated();
        return ref.id;
    } catch (error) {
        console.error("saveTask fehlgeschlagen:", error);
        throw error;
    }
}

/**
 * Saves the tutorial task for a newly registered user.
 * @param {string} userId - The id of the user.
 * @returns {Promise<string|null>} The id of the created task, or null if saving fails.
 */
export async function saveTutorialTask(userId) {
    try {
        const ref = doc(collection(db, "users", userId, "tasks"));
        await setDoc(ref, tutorialTask);
        return ref.id;
    } catch (error) {
        console.error("saveTutorialTask fehlgeschlagen:", error);
        return null;
    }
}

/**
 * Loads all tasks of the logged-in user from Firestore.
 * @returns {Promise<Task[]>} All tasks including their document id.
 * @throws {Error} If loading fails or no user is logged in.
 */
export async function getTasks() {
    try {
        const snap = await getDocs(getTasksCollection());
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (error) {
        console.error("getTasks fehlgeschlagen:", error);
        throw error;
    }
}

/**
 * Overwrites an existing task in Firestore and marks the cached tasks as outdated.
 * @param {string} taskId - The id of the task to update.
 * @param {Task} taskModell - The new task data without id.
 * @returns {Promise<void>}
 * @throws {Error} If updating fails or no user is logged in.
 */
export async function updateTask(taskId, taskModell) {
    try {
        await setDoc(doc(getTasksCollection(), taskId), taskModell);
        markTasksOutdated();
    } catch (error) {
        console.error("updateTask fehlgeschlagen:", error);
        throw error;
    }
}

/**
 * Finds the id of the first task with the given title.
 * @param {string} title - The title to search for.
 * @returns {Promise<string|null>} The id of the task, or null if no task matches.
 * @throws {Error} If the query fails or no user is logged in.
 */
export async function getTaskIdByTitle(title) {
    try {
        const titleQuery = query(getTasksCollection(), where("title", "==", title), limit(1));
        const snap = await getDocs(titleQuery);
        if (snap.empty) return null;
        return snap.docs[0].id;
    } catch (error) {
        console.error("getTaskIdByTitle fehlgeschlagen:", error);
        throw error;
    }
}

/**
 * Deletes a task in Firestore and marks the cached tasks as outdated.
 * @param {string} taskId - The id of the task to delete.
 * @returns {Promise<void>}
 * @throws {Error} If deleting fails or no user is logged in.
 */
export async function deleteTask(taskId) {
    try {
        await deleteDoc(doc(getTasksCollection(), taskId));
        markTasksOutdated();
    } catch (error) {
        console.error("deleteTask fehlgeschlagen:", error);
        throw error;
    }
}

/**
 * Marks the cached tasks in the session storage as outdated, so they are reloaded from Firestore.
 */
function markTasksOutdated() {
    try {
        sessionStorage.setItem("joinTasksOutdated", "true");
    } catch (error) {
        console.warn("Tasks could not be marked as outdated:", error);
    }
}
