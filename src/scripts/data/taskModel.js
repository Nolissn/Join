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