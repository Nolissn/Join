const iconPath = '../../assets/icons/';
const toastDuration = 2000;
let toastTimerId = null;

/**
 * Renders the sidebar and the header depending on the login state and highlights the active link.
 */
function renderLayout() {
  if (isUserLoggedIn()) {
    renderLoggedInLayout();
  } else {
    renderLoggedOutLayout();
  }
  markActiveNavLink();
}

/**
 * Renders the sidebar and the header for a logged-in user and registers the log out link.
 */
function renderLoggedInLayout() {
  document.querySelector('.sidebar').innerHTML = sidebarTemplate(iconPath);
  document.querySelector('.header').innerHTML = headerTemplate(iconPath, getCurrentUserInitials());
  document.getElementById('logOutLink').addEventListener('click', logOut);
}

/**
 * Renders the sidebar and the header for a visitor who is not logged in.
 */
function renderLoggedOutLayout() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.add('sidebarLoggedOut');
  sidebar.innerHTML = sidebarLoggedOutTemplate(iconPath);
  document.querySelector('.header').innerHTML = headerLoggedOutTemplate(iconPath);
}

/**
 * Logs out the current user and redirects to the login page.
 * @param {MouseEvent} event - The click event of the log out link.
 */
function logOut(event) {
  event.preventDefault();
  removeCurrentUser();
  location.replace('../../index.html');
}

/**
 * Returns the initials of the logged-in user for the header avatar.
 * @returns {string} The initials, or "G" for a guest.
 */
function getCurrentUserInitials() {
  if (currentUser === null) return 'G';
  if (currentUser.isGuest === true) return 'G';
  return getInitials(currentUser.name);
}

/**
 * Returns the initials of a name, built from the first letter of the first and the last name part.
 * @param {string} name - The full name.
 * @returns {string} One or two uppercase letters.
 */
function getInitials(name) {
  const nameParts = name.trim().split(' ');
  const firstLetter = nameParts[0].charAt(0);
  const lastLetter = nameParts[nameParts.length - 1].charAt(0);
  if (nameParts.length === 1) return firstLetter.toUpperCase();
  return (firstLetter + lastLetter).toUpperCase();
}

/**
 * Highlights the navigation link and the legal link of the current page.
 */
function markActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  markActiveLink('.navLink', currentPage, 'navLinkActive');
  markActiveLink('.legalLink', currentPage, 'legalLinkActive');
}

/**
 * Adds the active class to the link that points to the current page.
 * @param {string} linkClass - The CSS selector of the links, e.g. ".navLink".
 * @param {string} currentPage - The file name of the current page.
 * @param {string} activeClass - The class that marks the active link.
 */
function markActiveLink(linkClass, currentPage, activeClass) {
  const activeLink = document.querySelector(`${linkClass}[href="${currentPage}"]`);
  if (activeLink !== null) activeLink.classList.add(activeClass);
}

/**
 * Toggles the header menu when the avatar is clicked and closes it on a click outside the menu.
 * @param {MouseEvent} event - The click event.
 */
function handleHeaderMenuClick(event) {
  const headerMenu = document.querySelector('.headerMenu');
  if (headerMenu === null) return;
  if (event.target.closest('.headerAvatar')) {
    headerMenu.classList.toggle('headerMenuOpen');
  } else if (!event.target.closest('.headerMenu')) {
    headerMenu.classList.remove('headerMenuOpen');
  }
}

/**
 * Shows a short feedback message at the bottom of the page.
 * Needs an element with the id "toast" and the attribute popover="manual" on the page.
 * @param {string} message - The message to show.
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast === null) return;
  toast.textContent = message;
  if (toast.matches(':popover-open')) toast.hidePopover();
  toast.showPopover();
  clearTimeout(toastTimerId);
  toastTimerId = setTimeout(hideToast, toastDuration);
}

/**
 * Hides the feedback message.
 */
function hideToast() {
  const toast = document.getElementById('toast');
  if (toast.matches(':popover-open')) toast.hidePopover();
}

document.addEventListener('DOMContentLoaded', renderLayout);
document.addEventListener('click', handleHeaderMenuClick);
