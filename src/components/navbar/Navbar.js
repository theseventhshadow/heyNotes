import { createElement } from '../../utils/dom.js';
import { authService } from '../../services/authService.js';
import { getState, setState } from '../../state/appState.js';

export function Navbar() {
  const currentUser = authService.getCurrentUser();
  const themeButton = createElement('button', { type: 'button', className: 'navbar__action' });
  const profileButton = createElement('button', { type: 'button', className: 'navbar__action' }, 'Perfil');
  const logoutButton = createElement('button', { type: 'button', className: 'navbar__action navbar__action--danger' }, 'Cerrar sesión');

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

  profileButton.addEventListener('click', () => window.location.assign('/profile'));
  logoutButton.addEventListener('click', async () => {
    await authService.logout();
    window.location.assign('/');
  });

  return createElement(
    'nav',
    { className: 'navbar card' },
    createElement('span', { className: 'navbar__brand' }, 'heyNotes'),
    createElement('div', { className: 'navbar__actions' }, themeButton, profileButton, logoutButton),
  );
}
