import { db } from "./joinDbConfig.js";
import { tutorialTask } from "./tutorialTask.js";
import { doc, setDoc, collection, getDocs, deleteDoc, query, where, limit } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

function getTasksCollection() {
    if (typeof currentUser === "undefined" || currentUser === null) {
        throw new Error("No user is logged in");
    }
    return collection(db, "users", currentUser.id, "tasks");
}

// taskModell value = undefined is not allowed, because firestore does not accept undefined values. 
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

export async function getTasks() {
    try {
        const snap = await getDocs(getTasksCollection());
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (error) {
        console.error("getTasks fehlgeschlagen:", error);
        throw error;
    }
}

export async function updateTask(taskId, taskModell) {
    try {
        await setDoc(doc(getTasksCollection(), taskId), taskModell);
        markTasksOutdated();
    } catch (error) {
        console.error("updateTask fehlgeschlagen:", error);
        throw error;
    }
}

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

export async function deleteTask(taskId) {
    try {
        await deleteDoc(doc(getTasksCollection(), taskId));
        markTasksOutdated();
    } catch (error) {
        console.error("deleteTask fehlgeschlagen:", error);
        throw error;
    }
}

function markTasksOutdated() {
    try {
        localStorage.setItem("joinTasksOutdated", "true");
    } catch (error) {
        console.warn("Tasks could not be marked as outdated:", error);
    }
}
