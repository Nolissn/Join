const iconPath = '../../assets/icons/';

function renderLayout() {
  if (isUserLoggedIn()) {
    renderLoggedInLayout();
  } else {
    renderLoggedOutLayout();
  }
  markActiveNavLink();
}

function renderLoggedInLayout() {
  document.querySelector('.sidebar').innerHTML = sidebarTemplate(iconPath);
  document.querySelector('.header').innerHTML = headerTemplate(iconPath, getCurrentUserInitials());
  document.getElementById('logOutLink').addEventListener('click', logOut);
}

function renderLoggedOutLayout() {
  document.querySelector('.sidebar').innerHTML = sidebarLoggedOutTemplate(iconPath);
  document.querySelector('.header').innerHTML = headerLoggedOutTemplate(iconPath);
}

function logOut(event) {
  event.preventDefault();
  removeCurrentUser();
  location.replace('../../index.html');
}

function getCurrentUserInitials() {
  if (currentUser === null) return 'G';
  return getInitials(currentUser.name);
}

function getInitials(name) {
  const nameParts = name.trim().split(' ');
  const firstLetter = nameParts[0].charAt(0);
  const lastLetter = nameParts[nameParts.length - 1].charAt(0);
  if (nameParts.length === 1) return firstLetter.toUpperCase();
  return (firstLetter + lastLetter).toUpperCase();
}

function markActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelector(`.navLink[href="${currentPage}"]`)?.classList.add('navLinkActive');
}

function handleHeaderMenuClick(event) {
  const headerMenu = document.querySelector('.headerMenu');
  if (headerMenu === null) return;
  if (event.target.closest('.headerAvatar')) {
    headerMenu.classList.toggle('headerMenuOpen');
  } else if (!event.target.closest('.headerMenu')) {
    headerMenu.classList.remove('headerMenuOpen');
  }
}

document.addEventListener('DOMContentLoaded', renderLayout);
document.addEventListener('click', handleHeaderMenuClick);
