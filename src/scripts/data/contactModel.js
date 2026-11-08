export function createContact(name, email, phone, color) {
    return Object.seal({
        name: name,
        email: email,
        phone: phone,
        color: color,
    });
}
