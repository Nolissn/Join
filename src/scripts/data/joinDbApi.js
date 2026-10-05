import { db } from "./joinDbConfig.js";
import { doc, setDoc, collection, getDocs, deleteDoc  } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// taskModell value = undefined is not allowed, because firestore does not accept undefined values. 
export async function saveTask(taskModell) {
    try {
        const ref = doc(collection(db, "tasks"));
        await setDoc(ref, taskModell);
        return ref.id;
    } catch (error) {
        console.error("saveTask fehlgeschlagen:", error);
        throw error;
    }
}

export async function getTasks() {
    try {
        const snap = await getDocs(collection(db, "tasks"));
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (error) {
        console.error("getTasks fehlgeschlagen:", error);
        throw error;
    }
}

export async function updateTask(taskId, taskModell) {
    try {
        await setDoc(doc(db, "tasks", taskId), taskModell);
    } catch (error) {
        console.error("updateTask fehlgeschlagen:", error);
        throw error;
    }
}

export async function deleteTask(taskId) {
    try {
        await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
        console.error("deleteTask fehlgeschlagen:", error);
        throw error;
    }
}