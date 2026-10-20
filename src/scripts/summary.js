function initSummary() {
  const summaryElements = getSummaryElements();
  if (summaryElements === null) return;

  if (currentUser && currentUser.isGuest !== true) {
    renderCurrentUser(summaryElements);
  } else {
    renderGuest(summaryElements);
  }
}

function getSummaryElements() {
  const greetingElement = document.querySelector(".summary-greeting .greeting-message");
  const nameElement = document.querySelector(".summary-greeting .name");
  if (greetingElement === null || nameElement === null) return null;
  return { greetingElement, nameElement };
}

function renderCurrentUser({ greetingElement, nameElement }) {
  greetingElement.textContent = "Good Morning,";
  nameElement.textContent = currentUser.name;
}

function renderGuest({ greetingElement, nameElement }) {
  nameElement.textContent = "";
  greetingElement.textContent = "Good Morning!";
}

initSummary();
