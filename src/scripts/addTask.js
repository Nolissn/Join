function setPriority(priority) {
    const buttonId = `priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
    const selectedButton = document.getElementById(buttonId);
    const isActive = selectedButton.classList.contains("btn-active");

    document.querySelectorAll(".priority-btn").forEach(button => {
        button.classList.remove("btn-active", "priority-urgent", "priority-medium", "priority-low");
    });

    if (!isActive) {
        selectedButton.classList.add("btn-active", `priority-${priority}`);
    }

    updatePriorityIcons();
    updateCreateTaskButton();
}

function updatePriorityIcons() {
    document.querySelectorAll(".priority-btn").forEach(button => {
        const icon = button.querySelector(".priority-btn-icon");
        const iconName = button.classList.contains("btn-active") && icon.dataset.activeIcon
            ? icon.dataset.activeIcon
            : icon.dataset.icon;
        icon.src = `../../assets/icons/${iconName}`;
    });
}

function updateCreateTaskButton() {
    const form = document.querySelector("form");
    const createTaskButton = document.querySelector(".create-task-btn");
    const hasSelectedPriority = document.querySelector(".priority-btn.btn-active") !== null;
    const hasTextContent = [...form.querySelectorAll('input[type="text"], textarea')]
        .every(field => field.value.trim().length > 0);

    createTaskButton.disabled = !form.checkValidity() || !hasTextContent || !hasSelectedPriority;
}

function clearTaskForm() {
    const form = document.querySelector("form");
    form.reset();

    document.querySelectorAll(".priority-btn").forEach(button => {
        button.classList.remove("btn-active", "priority-urgent", "priority-medium", "priority-low");
    });
    document.getElementById("priorityMedium").classList.add("btn-active", "priority-medium");

    updatePriorityIcons();
    updateCreateTaskButton();
}

const addTaskForm = document.querySelector("form");
addTaskForm.addEventListener("input", updateCreateTaskButton);
addTaskForm.addEventListener("change", updateCreateTaskButton);
updateCreateTaskButton();