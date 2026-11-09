/**
 * @typedef {Object} Subtask
 * @property {string} title - The title of the subtask.
 * @property {boolean} done - Whether the subtask is done.
 */

/**
 * @typedef {Object} Task
 * @property {string} [id] - The Firestore document id.
 * @property {string} title - The title of the task.
 * @property {string} description - The description of the task.
 * @property {string} dueDate - The due date in the format YYYY-MM-DD.
 * @property {string} priority - "urgent", "medium" or "low".
 * @property {Object[]} assignedTo - The assigned contacts.
 * @property {string} category - "User Story" or "Technical Task".
 * @property {Subtask[]} subtasks - The subtasks of the task.
 * @property {string} status - "todo", "inProgress", "awaitFeedback" or "done".
 * @property {number} [order] - The position of the task in its column.
 */


/**
 * Creates an empty, sealed task object.
 * @param {string} [status="todo"] - The board column of the new task.
 * @returns {Task} The new task.
 */
function createTask(status = "todo") {
    return Object.seal({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        assignedTo: [],
        category: "",
        subtasks: [],
        status: status
    });
}