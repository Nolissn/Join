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

document.addEventListener('DOMContentLoaded', renderLayout);
