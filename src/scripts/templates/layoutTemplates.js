/**
 * Returns the HTML of the sidebar for a logged-in user.
 * @param {string} iconPath - The path to the icon folder.
 * @returns {string} The sidebar HTML.
 */
function sidebarTemplate(iconPath) {
  return `
    <a class="sidebarLogo" href="summary.html"><img class="sidebarLogoImg" src="${iconPath}join_icon_bright.svg" alt="Join Logo"></a>
    <nav class="navMain">
      <a class="navLink" href="summary.html"><img class="navIcon" src="${iconPath}summary.svg" alt="">Summary</a>
      <a class="navLink" href="addTask.html"><img class="navIcon" src="${iconPath}add_task.svg" alt="">Add Task</a>
      <a class="navLink" href="board.html"><img class="navIcon" src="${iconPath}board.svg" alt="">Board</a>
      <a class="navLink" href="contacts.html"><img class="navIcon" src="${iconPath}contacts.svg" alt="">Contacts</a>
    </nav>
    <nav class="navLegal">
      <a class="legalLink" href="privacyPolicy.html">Privacy Policy</a>
      <a class="legalLink" href="legalNotice.html">Legal notice</a>
    </nav>`;
}

/**
 * Returns the HTML of the header for a logged-in user.
 * @param {string} iconPath - The path to the icon folder.
 * @param {string} initials - The initials shown in the avatar.
 * @returns {string} The header HTML.
 */
function headerTemplate(iconPath, initials) {
  return `
    <a class="headerLogo" href="summary.html"><img class="headerLogoImg" src="${iconPath}join_icon_dark.svg" alt="Join Logo"></a>
    <p class="headerTitle">Kanban Project Management Tool</p>
    <div class="headerActions">
      <a class="headerHelp" href="help.html"><img class="headerHelpIcon" src="${iconPath}help.svg" alt="Help"></a>
      <button class="headerAvatar" type="button">${initials}</button>
      <nav class="headerMenu">
        <a class="headerMenuLink headerMenuLinkMobile" href="help.html">Help</a>
        <a class="headerMenuLink" href="legalNotice.html">Legal Notice</a>
        <a class="headerMenuLink" href="privacyPolicy.html">Privacy Policy</a>
        <a id="logOutLink" class="headerMenuLink" href="../../index.html">Log out</a>
      </nav>
    </div>`;
}

/**
 * Returns the HTML of the sidebar for a visitor who is not logged in.
 * @param {string} iconPath - The path to the icon folder.
 * @returns {string} The sidebar HTML.
 */
function sidebarLoggedOutTemplate(iconPath) {
  return `
    <a class="sidebarLogo" href="../../index.html"><img class="sidebarLogoImg" src="${iconPath}join_icon_bright.svg" alt="Join Logo"></a>
    <nav class="navMain">
      <a class="navLink" href="../../index.html"><img class="navIcon" src="${iconPath}login_icon.svg" alt="">Log In</a>
    </nav>
    <nav class="navLegal">
      <a class="legalLink" href="privacyPolicy.html">Privacy Policy</a>
      <a class="legalLink" href="legalNotice.html">Legal notice</a>
    </nav>`;
}

/**
 * Returns the HTML of the header for a visitor who is not logged in.
 * @param {string} iconPath - The path to the icon folder.
 * @returns {string} The header HTML.
 */
function headerLoggedOutTemplate(iconPath) {
  return `
    <a class="headerLogo" href="../../index.html"><img class="headerLogoImg" src="${iconPath}join_icon_dark.svg" alt="Join Logo"></a>
    <p class="headerTitle">Kanban Project Management Tool</p>`;
}

/**
 * Returns the HTML of the session timeout warning and the goodbye dialog.
 * @param {string} iconPath - The path to the icon folder.
 * @returns {string} The session timeout HTML.
 */
function sessionTimeoutTemplate(iconPath) {
  return `
    <div id="sessionOverlay" class="sessionOverlay"></div>
    <div id="sessionWarning" class="sessionWarning" role="status" aria-live="polite">
      <p class="sessionWarningText">You will be logged out due to inactivity in <span id="sessionWarningTime" class="sessionWarningTime"></span>.</p>
      <button class="sessionWarningButton" type="button">Stay logged in</button>
    </div>
    <dialog id="sessionGoodbyeDialog" class="sessionGoodbyeDialog">
      <img class="sessionGoodbyeLogo" src="${iconPath}join_icon_bright.svg" alt="Join Logo">
      <p class="sessionGoodbyeTitle">See you next time!</p>
      <p class="sessionGoodbyeText">You have been logged out due to inactivity.</p>
    </dialog>`;
}
