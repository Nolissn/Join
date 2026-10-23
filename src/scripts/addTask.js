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
addTaskForm.addEventListener("input", updateCreateTaskButton);
addTaskForm.addEventListener("change", updateCreateTaskButton);
addTaskForm.addEventListener("reset", scheduleCustomSelectReset);
updateCreateTaskButton();
