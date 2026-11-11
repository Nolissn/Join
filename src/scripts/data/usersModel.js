/**
 * @typedef {Object} User
 * @property {string} [id] - The Firestore document id.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user in lowercase.
 * @property {string} password - The password of the user.
 */

/**
 * Creates a sealed user object.
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {User} The new user.
 */
export function createUser(name, email, password) {
    return Object.seal({
        name: name,
        email: email,
        password: password,
    });
}
