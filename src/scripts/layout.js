const iconPath = '../../assets/icons/';
const currentUserInitials = 'SM';

function renderLayout() {
  document.querySelector('.sidebar').innerHTML = sidebarTemplate(iconPath);
  document.querySelector('.header').innerHTML = headerTemplate(iconPath, currentUserInitials);
  markActiveNavLink();
}

function markActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelector(`.navLink[href="${currentPage}"]`)?.classList.add('navLinkActive');
}

function handleHeaderMenuClick(event) {
  const headerMenu = document.querySelector('.headerMenu');
  if (event.target.closest('.headerAvatar')) {
    headerMenu.classList.toggle('headerMenuOpen');
  } else if (!event.target.closest('.headerMenu')) {
    headerMenu.classList.remove('headerMenuOpen');
  }
}

document.addEventListener('DOMContentLoaded', renderLayout);
document.addEventListener('click', handleHeaderMenuClick);
