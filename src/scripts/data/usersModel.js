export function createUser(name, email, password) {
    return Object.seal({
        name: name,
        email: email,
        password: password,
    });
}
