const maxSelectedAvatars = 6;

/**
 * @typedef {Object} CustomSelectContext
 * @property {HTMLElement} container - The custom select container.
 * @property {HTMLSelectElement} select - The hidden native select.
 * @property {HTMLElement} trigger - The button that opens the menu.
 * @property {HTMLElement} menu - The list of options.
 */

/**
 * Closes the menu of a custom select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function closeCustomSelect(context) {
    context.trigger.setAttribute("aria-expanded", "false");
    context.menu.hidden = true;
    syncCustomSelectSelection(context);
}


/**
 * Synchronizes menu selection and displays assigned-contact initials when the menu is closed.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function syncCustomSelectSelection(context) {
    const selectedOptions = [...context.select.selectedOptions];
    const isAssignedSelect = context.select.id === "assignedValue";
    context.trigger.textContent = isAssignedSelect
        ? "Assigned To"
        : context.select.options[context.select.selectedIndex].textContent;
    context.menu.querySelectorAll('[role="option"]').forEach(option => {
        const isSelected = selectedOptions.some(selected => selected.value === option.dataset.value);
        option.setAttribute("aria-selected", String(isSelected));
    });
    if (isAssignedSelect) {
        renderSelectedContactAvatars(context, selectedOptions);
    }
}


/**
 * Shows the initials of the assigned contacts below the assignee select.
 * While the menu is open, the avatars are only made invisible.
 * Shows at most the maximum number of avatars and a "+n" avatar for the remaining contacts, so the avatars stay in one row.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {HTMLOptionElement[]} selectedOptions - The selected options of the select.
 */
function renderSelectedContactAvatars(context, selectedOptions) {
    const selectedContacts = context.container.querySelector(".custom-select-selected-contacts");
    selectedContacts.replaceChildren();
    selectedOptions.slice(0, maxSelectedAvatars).forEach(option => {
        selectedContacts.append(createSelectedContactAvatar(option));
    });
    appendMoreContactsAvatar(selectedContacts, selectedOptions.length);
    selectedContacts.hidden = selectedOptions.length === 0;
    selectedContacts.classList.toggle("custom-select-selected-contacts-covered", !context.menu.hidden);
}


/**
 * Creates the avatar of an assigned contact as an item of the avatar list.
 * @param {HTMLOptionElement} option - The option of the contact.
 * @returns {HTMLElement} The avatar element.
 */
function createSelectedContactAvatar(option) {
    const avatar = createContactAvatar(option);
    avatar.setAttribute("role", "listitem");
    avatar.setAttribute("aria-label", option.textContent);
    return avatar;
}


/**
 * Adds a "+n" avatar for the assigned contacts that exceed the maximum number of shown avatars.
 * @param {HTMLElement} selectedContacts - The avatar list.
 * @param {number} selectedCount - The number of assigned contacts.
 */
function appendMoreContactsAvatar(selectedContacts, selectedCount) {
    if (selectedCount <= maxSelectedAvatars) return;
    const hiddenCount = selectedCount - maxSelectedAvatars;
    const moreAvatar = document.createElement("span");
    moreAvatar.className = "custom-select-avatar custom-select-avatar-more";
    moreAvatar.textContent = `+${hiddenCount}`;
    moreAvatar.setAttribute("role", "listitem");
    moreAvatar.setAttribute("aria-label", `${hiddenCount} more contacts`);
    selectedContacts.append(moreAvatar);
}


/**
 * Creates the initials avatar of a contact option in the color of the contact.
 * @param {HTMLOptionElement} option - The option of the contact.
 * @returns {HTMLElement} The avatar element.
 */
function createContactAvatar(option) {
    const contact = storedContacts.find(item => item.id === option.value);
    const avatar = document.createElement("span");
    avatar.className = `custom-select-avatar ${contact?.color || ""}`;
    avatar.textContent = getInitials(option.textContent);
    return avatar;
}


/**
 * Selects the clicked option, fires a change event, closes the menu and focuses the trigger.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {HTMLElement} option - The clicked menu option.
 */
function handleCustomSelectOptionClick(context, option) {
    if (context.select.multiple) {
        const selectedOption = [...context.select.options].find(item => item.value === option.dataset.value);
        selectedOption.selected = !selectedOption.selected;
        context.select.dispatchEvent(new Event("change", { bubbles: true }));
        option.focus();
        return;
    }
    context.select.value = option.dataset.value;
    context.select.dispatchEvent(new Event("change", { bubbles: true }));
    closeCustomSelect(context);
    context.trigger.focus();
}


/**
 * Creates the empty element of a menu option with its role, selection state and value.
 * @param {HTMLOptionElement} option - The option of the select.
 * @returns {HTMLElement} The menu option element.
 */
function createMenuOptionElement(option) {
    const menuOption = document.createElement("div");
    menuOption.className = "custom-select-option";
    menuOption.setAttribute("role", "option");
    menuOption.setAttribute("aria-selected", "false");
    menuOption.tabIndex = -1;
    menuOption.dataset.value = option.value;
    return menuOption;
}


/**
 * Creates a menu option for an option of the hidden select.
 * @param {HTMLOptionElement} option - The option of the select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @returns {HTMLElement} The menu option.
 */
function createCustomSelectOption(option, context) {
    const menuOption = createMenuOptionElement(option);
    if (context.select.id === "assignedValue") {
        const avatar = createContactAvatar(option);
        avatar.setAttribute("aria-hidden", "true");
        menuOption.append(avatar);
    }
    const label = document.createElement("span");
    label.className = "custom-select-option-label";
    label.textContent = option.textContent;
    menuOption.append(label);
    menuOption.addEventListener("click", handleCustomSelectOptionClick.bind(null, context, menuOption));
    return menuOption;
}


/**
 * Fills the menu with all visible and enabled options of the select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function populateCustomSelectMenu(context) {
    const options = [...context.select.options].filter(option => !option.hidden && !option.disabled);
    options.forEach(option => context.menu.append(createCustomSelectOption(option, context)));
}


/**
 * Closes all custom selects of the form except the given one.
 * @param {CustomSelectContext} context - The custom select that stays open.
 */
function closeOtherCustomSelects(context) {
    addTaskForm.querySelectorAll(".custom-select").forEach(container => {
        if (container !== context.container) closeCustomSelect(getCustomSelectContext(container));
    });
}


/**
 * Collects the elements of a custom select.
 * @param {HTMLElement} container - The custom select container.
 * @returns {CustomSelectContext} The container, the select, the trigger and the menu.
 */
function getCustomSelectContext(container) {
    return {
        container,
        select: container.querySelector("select"),
        trigger: container.querySelector(".custom-select-trigger"),
        menu: container.querySelector(".custom-select-menu")
    };
}


/**
 * Focuses the selected option, or the first option if none is selected.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function focusSelectedCustomOption(context) {
    const selected = context.menu.querySelector('[aria-selected="true"]');
    const firstOption = context.menu.querySelector('[role="option"]');
    (selected || firstOption).focus();
}


/**
 * Opens the menu of a custom select and closes all other menus.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {boolean} [focusSelected=false] - Whether the selected option should be focused.
 */
function openCustomSelect(context, focusSelected = false) {
    closeOtherCustomSelects(context);
    context.menu.hidden = false;
    context.trigger.setAttribute("aria-expanded", "true");
    syncCustomSelectSelection(context);
    if (focusSelected) focusSelectedCustomOption(context);
}


/**
 * Opens or closes the menu of a custom select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function toggleCustomSelect(context) {
    if (context.menu.hidden) openCustomSelect(context);
    else closeCustomSelect(context);
}


/**
 * Opens the menu and focuses the selected option when ArrowDown, Enter or Space is pressed on the trigger.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleCustomSelectTriggerKeydown(context, event) {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    openCustomSelect(context, true);
}


/**
 * Calculates the index of the option to focus for a navigation key.
 * @param {string} key - The pressed key.
 * @param {HTMLElement[]} options - The menu options.
 * @param {number} currentIndex - The index of the focused option.
 * @returns {number} The new index, or -1 if the key is no navigation key.
 */
function getNextMenuOptionIndex(key, options, currentIndex) {
    if (key === "ArrowDown") return (currentIndex + 1) % options.length;
    if (key === "ArrowUp") return currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    if (key === "Home") return 0;
    if (key === "End") return options.length - 1;
    return -1;
}


/**
 * Moves the focus to another option when a navigation key is pressed.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {boolean} True if the focus was moved.
 */
function focusNextCustomOption(context, event) {
    const options = [...context.menu.querySelectorAll('[role="option"]')];
    const index = options.indexOf(document.activeElement);
    const nextIndex = getNextMenuOptionIndex(event.key, options, index);
    if (nextIndex === -1) return false;
    event.preventDefault();
    options[nextIndex].focus();
    return true;
}


/**
 * Handles keys in the open menu: navigates, selects with Enter or Space and closes with Escape.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {KeyboardEvent} event - The keydown event.
 */
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


/**
 * Builds the menu of a custom select and registers its event listeners.
 * @param {HTMLElement} container - The custom select container.
 */
function initializeCustomSelect(container) {
    const context = getCustomSelectContext(container);
    if (context.select.multiple) context.menu.setAttribute("aria-multiselectable", "true");
    populateCustomSelectMenu(context);
    context.trigger.addEventListener("click", () => toggleCustomSelect(context));
    context.trigger.addEventListener("keydown", handleCustomSelectTriggerKeydown.bind(null, context));
    context.menu.addEventListener("keydown", handleCustomSelectMenuKeydown.bind(null, context));
    context.select.addEventListener("change", () => syncCustomSelectSelection(context));
    syncCustomSelectSelection(context);
}


/**
 * Shows the reset values in all custom selects and closes their menus.
 */
function resetCustomSelects() {
    addTaskForm.querySelectorAll(".custom-select").forEach(container => {
        const context = getCustomSelectContext(container);
        syncCustomSelectSelection(context);
        closeCustomSelect(context);
    });
}


/**
 * Resets the custom selects in the next animation frame, after the form reset is done.
 */
function scheduleCustomSelectReset() {
    requestAnimationFrame(resetCustomSelects);
}


/**
 * Checks whether an event happened outside of a custom select.
 * Focus that moves to an element containing the custom select, e.g. the dialog in Safari, does not count as outside.
 * @param {Event} event - The click or focusin event.
 * @param {HTMLElement} container - The custom select container.
 * @returns {boolean} True if the event happened outside of the custom select.
 */
function isOutsideCustomSelect(event, container) {
    if (container.contains(event.target)) return false;
    return event.type !== "focusin" || !event.target.contains(container);
}


/**
 * Closes the open custom selects of the add task form when the user clicks or focuses outside of them.
 * @param {Event} event - The click or focusin event.
 */
function handleOutsideCustomSelectClick(event) {
    if (!addTaskForm) return;
    addTaskForm.querySelectorAll(".custom-select").forEach(function (container) {
        const context = getCustomSelectContext(container);
        if (!context.menu.hidden && isOutsideCustomSelect(event, container)) closeCustomSelect(context);
    });
}
