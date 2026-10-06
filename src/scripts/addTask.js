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

    document.querySelectorAll(".priority-btn").forEach(button => {
        const icon = button.querySelector(".priority-btn-icon");
        const iconName = button.classList.contains("btn-active") && icon.dataset.activeIcon
            ? icon.dataset.activeIcon
            : icon.dataset.icon;
        icon.src = `../../assets/icons/${iconName}`;
    });
}