import { db } from "./joinDbConfig.js";
import { doc, setDoc, collection, getDocsFromServer, query, where, limit } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/**
 * Saves a new user in Firestore.
 * @param {User} user - The user data.
 * @returns {Promise<string>} The id of the created user.
 * @throws {Error} If saving fails.
 */
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

/**
 * Finds the user with the given email.
 * The query is always sent to the server, so no outdated cached data is used.
 * @param {string} email - The email in lowercase.
 * @returns {Promise<User|null>} The user including its id, or null if no user has this email.
 * @throws {Error} If the query fails.
 */
export async function getUserByEmail(email) {
    try {
        const emailQuery = query(collection(db, "users"), where("email", "==", email), limit(1));
        const snap = await getDocsFromServer(emailQuery);
        if (snap.empty) return null;
        const userDoc = snap.docs[0];
        return { ...userDoc.data(), id: userDoc.id };
    } catch (error) {
        console.error("getUserByEmail fehlgeschlagen:", error);
        throw error;
    }
}