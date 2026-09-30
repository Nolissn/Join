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

function headerTemplate(iconPath, initials) {
  return `
    <p class="headerTitle">Kanban Project Management Tool</p>
    <div class="headerActions">
      <a class="headerHelp" href="help.html"><img class="headerHelpIcon" src="${iconPath}help.svg" alt="Help"></a>
      <button class="headerAvatar" type="button">${initials}</button>
    </div>`;
}
