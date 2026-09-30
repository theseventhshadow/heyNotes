import { createElement } from '../../utils/dom.js';
import { authService } from '../../services/authService.js';
import { getState, setState } from '../../state/appState.js';

export function Navbar() {
  const currentUser = authService.getCurrentUser();
  const themeButton = createElement('button', { type: 'button', className: 'navbar__action' });
  const profileButton = createElement('button', { type: 'button', className: 'navbar__action' }, 'Perfil');
  const logoutButton = createElement('button', { type: 'button', className: 'navbar__action navbar__action--danger' }, 'Cerrar sesión');
  const profileDialog = createElement('dialog', { className: 'profile-dialog' });
  const closeProfileButton = createElement('button', { type: 'button', className: 'profile-dialog__close' }, 'Cerrar');

  function updateThemeButton(theme) {
    themeButton.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    themeButton.setAttribute('aria-label', `Cambiar a ${theme === 'dark' ? 'modo claro' : 'modo oscuro'}`);
  }

  updateThemeButton(getState().theme);
  themeButton.addEventListener('click', () => {
    const nextTheme = getState().theme === 'dark' ? 'light' : 'dark';
    setState({ theme: nextTheme });
    document.documentElement.dataset.theme = nextTheme;
    updateThemeButton(nextTheme);
  });

  profileButton.addEventListener('click', () => profileDialog.showModal());
  closeProfileButton.addEventListener('click', () => profileDialog.close());
  logoutButton.addEventListener('click', () => {
    authService.logout();
    window.location.assign('/');
  });

  profileDialog.append(
    createElement('p', { className: 'eyebrow' }, 'Perfil'),
    createElement('h2', {}, currentUser?.name || 'Usuario'),
    createElement('p', {}, currentUser?.email || ''),
    closeProfileButton,
  );

  return createElement(
    'nav',
    { className: 'navbar card' },
    createElement('span', { className: 'navbar__brand' }, 'heyNotes'),
    createElement('div', { className: 'navbar__actions' }, themeButton, profileButton, logoutButton),
    profileDialog,
  );
}
