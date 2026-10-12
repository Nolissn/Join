import { db } from "./joinDbConfig.js";
import { doc, setDoc, collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

export async function registerUser(user) {
    try {
        const ref = doc(collection(db, "users"));
        await setDoc(ref, user);
        return ref.id;
    } catch (error) {
        console.error("registerUser fehlgeschlagen:", error);
        throw error;
    }
}

export async function getUserByEmail(email) {
    try {
        const emailQuery = query(collection(db, "users"), where("email", "==", email), limit(1));
        const snap = await getDocs(emailQuery);
        if (snap.empty) return null;
        const userDoc = snap.docs[0];
        return { ...userDoc.data(), id: userDoc.id };
    } catch (error) {
        console.error("getUserByEmail fehlgeschlagen:", error);
        throw error;
    }
}