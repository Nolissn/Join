function clearPriorityButtons() {
    document.querySelectorAll(".priority-btn").forEach(button => {
        button.classList.remove("btn-active", "priority-urgent", "priority-medium", "priority-low");
    });
}

function setPriority(priority) {
    const buttonId = `priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
    const selectedButton = document.getElementById(buttonId);
    const isActive = selectedButton.classList.contains("btn-active");
    clearPriorityButtons();
    if (!isActive) selectedButton.classList.add("btn-active", `priority-${priority}`);
    updatePriorityIcons();
    updateCreateTaskButton();
}

function updatePriorityIcon(button) {
    const icon = button.querySelector(".priority-btn-icon");
    const activeIcon = button.classList.contains("btn-active") && icon.dataset.activeIcon;
    icon.src = `../../assets/icons/${activeIcon || icon.dataset.icon}`;
}

function updatePriorityIcons() {
    document.querySelectorAll(".priority-btn").forEach(updatePriorityIcon);
}

let isSavingTask = false;

function updateCreateTaskButton() {
    const form = document.querySelector("form");
    const createTaskButton = document.querySelector(".create-task-btn");
    const hasSelectedPriority = document.querySelector(".priority-btn.btn-active") !== null;
    const hasTextContent = [...form.querySelectorAll('input[type="text"], textarea')]
        .every(field => field.value.trim().length > 0);
    createTaskButton.disabled = isSavingTask || !form.checkValidity() || !hasTextContent || !hasSelectedPriority;
}

function getSelectedPriority() {
    const selectedButton = document.querySelector(".priority-btn.btn-active");
    return selectedButton.id.replace("priority", "").toLowerCase();
}

function getTaskAssignees(formData) {
    const assignedOption = document.getElementById("assignedValue").selectedOptions[0];
    return [{ id: formData.get("assigned"), name: assignedOption.textContent }];
}

function getTaskSubtasks(formData) {
    return [{ title: formData.get("subtasks").trim(), done: false }];
}

function getTaskFromForm() {
    const formData = new FormData(addTaskForm);
    return {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        dueDate: formData.get("dueDate"),
        priority: getSelectedPriority(),
        assignedTo: getTaskAssignees(formData),
        category: formData.get("category"),
        subtasks: getTaskSubtasks(formData),
        status: "todo"
    };
}

function startTaskSave(statusMessage) {
    isSavingTask = true;
    statusMessage.hidden = true;
    updateCreateTaskButton();
}

async function persistTask() {
    const { saveTask } = await import("./data/joinDbApi.js");
    await saveTask(getTaskFromForm());
}

function showTaskStatus(statusMessage, state, message) {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
    statusMessage.hidden = false;
}

function handleTaskSaveSuccess(statusMessage) {
    clearTaskForm();
    showTaskStatus(statusMessage, "success", "Task created successfully.");
}

function handleTaskSaveError(statusMessage, error) {
    console.error("Task could not be created:", error);
    showTaskStatus(statusMessage, "error", "Task could not be saved. Please try again.");
}

function finishTaskSave() {
    isSavingTask = false;
    updateCreateTaskButton();
}

async function createTask(event) {
    event.preventDefault();
    if (!addTaskForm.reportValidity()) return;
    const statusMessage = document.getElementById("taskFormStatus");
    startTaskSave(statusMessage);
    try {
        await persistTask();
        handleTaskSaveSuccess(statusMessage);
    } catch (error) {
        handleTaskSaveError(statusMessage, error);
    } finally {
        finishTaskSave();
    }
}

function clearTaskForm() {
    const form = document.querySelector("form");
    form.reset();
    clearPriorityButtons();
    document.getElementById("priorityMedium").classList.add("btn-active", "priority-medium");
    updatePriorityIcons();
    updateCreateTaskButton();
}

function closeCustomSelect(context) {
    context.trigger.setAttribute("aria-expanded", "false");
    context.menu.hidden = true;
}

function syncCustomSelectSelection(context) {
    const selectedOption = context.select.options[context.select.selectedIndex];
    context.trigger.textContent = selectedOption.textContent;
    context.menu.querySelectorAll('[role="option"]').forEach(option => {
        option.setAttribute("aria-selected", String(option.dataset.value === context.select.value));
    });
}

function handleCustomSelectOptionClick(context, option) {
    context.select.value = option.dataset.value;
    context.select.dispatchEvent(new Event("change", { bubbles: true }));
    closeCustomSelect(context);
    context.trigger.focus();
}

function createCustomSelectOption(option, context) {
    const menuOption = document.createElement("div");
    menuOption.className = "custom-select-option";
    menuOption.setAttribute("role", "option");
    menuOption.setAttribute("aria-selected", "false");
    menuOption.tabIndex = -1;
    menuOption.dataset.value = option.value;
    menuOption.textContent = option.textContent;
    menuOption.addEventListener("click", handleCustomSelectOptionClick.bind(null, context, menuOption));
    return menuOption;
}

function populateCustomSelectMenu(context) {
    const options = [...context.select.options].filter(option => !option.hidden && !option.disabled);
    options.forEach(option => context.menu.append(createCustomSelectOption(option, context)));
}

function closeOtherCustomSelects(context) {
    document.querySelectorAll(".custom-select").forEach(container => {
        if (container !== context.container) closeCustomSelect(getCustomSelectContext(container));
    });
}

function getCustomSelectContext(container) {
    return {
        container,
        select: container.querySelector("select"),
        trigger: container.querySelector(".custom-select-trigger"),
        menu: container.querySelector(".custom-select-menu")
    };
}

function focusSelectedCustomOption(context) {
    const selected = context.menu.querySelector('[aria-selected="true"]');
    const firstOption = context.menu.querySelector('[role="option"]');
    (selected || firstOption).focus();
}

function openCustomSelect(context, focusSelected = false) {
    closeOtherCustomSelects(context);
    context.menu.hidden = false;
    context.trigger.setAttribute("aria-expanded", "true");
    if (focusSelected) focusSelectedCustomOption(context);
}

function toggleCustomSelect(context) {
    if (context.menu.hidden) openCustomSelect(context);
    else closeCustomSelect(context);
}

function handleCustomSelectTriggerKeydown(context, event) {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    openCustomSelect(context, true);
}

function getNextMenuOptionIndex(key, options, currentIndex) {
    if (key === "ArrowDown") return (currentIndex + 1) % options.length;
    if (key === "ArrowUp") return currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    if (key === "Home") return 0;
    if (key === "End") return options.length - 1;
    return -1;
}

function focusNextCustomOption(context, event) {
    const options = [...context.menu.querySelectorAll('[role="option"]')];
    const index = options.indexOf(document.activeElement);
    const nextIndex = getNextMenuOptionIndex(event.key, options, index);
    if (nextIndex === -1) return false;
    event.preventDefault();
    options[nextIndex].focus();
    return true;
}

function handleCustomSelectMenuKeydown(context, event) {
    if (focusNextCustomOption(context, event)) return;
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        document.activeElement.click();
    }
    if (event.key === "Escape") {
        closeCustomSelect(context);
        context.trigger.focus();
    }
}

function initializeCustomSelect(container) {
    const context = getCustomSelectContext(container);
    populateCustomSelectMenu(context);
    context.trigger.addEventListener("click", () => toggleCustomSelect(context));
    context.trigger.addEventListener("keydown", handleCustomSelectTriggerKeydown.bind(null, context));
    context.menu.addEventListener("keydown", handleCustomSelectMenuKeydown.bind(null, context));
    context.select.addEventListener("change", () => syncCustomSelectSelection(context));
    syncCustomSelectSelection(context);
}

function resetCustomSelects() {
    document.querySelectorAll(".custom-select").forEach(container => {
        const context = getCustomSelectContext(container);
        syncCustomSelectSelection(context);
        closeCustomSelect(context);
    });
}

function scheduleCustomSelectReset() {
    requestAnimationFrame(resetCustomSelects);
}

const addTaskForm = document.querySelector("form");
document.querySelectorAll(".custom-select").forEach(initializeCustomSelect);
addTaskForm.addEventListener("submit", createTask);
addTaskForm.addEventListener("input", updateCreateTaskButton);
addTaskForm.addEventListener("change", updateCreateTaskButton);
addTaskForm.addEventListener("reset", scheduleCustomSelectReset);
updateCreateTaskButton();
