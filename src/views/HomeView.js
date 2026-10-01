import { createElement } from '../utils/dom.js';
import { authService } from '../services/authService.js';

export function HomeView() {
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    return createAuthenticatedHome(currentUser);
  }

  return createAuthHome();
}

function createAuthHome() {
  let mode = 'login';
  const section = createElement('section', { className: 'welcome-view' });
  const formPanel = createElement('div', { className: 'welcome-panel' });
  const form = createElement('form', { className: 'auth-form' });
  const modeButton = createElement('button', { type: 'button', className: 'auth-switch' });
  const status = createElement('p', { className: 'auth-status', role: 'status' });

  function renderForm() {
    const isLogin = mode === 'login';
    const nameField = isLogin ? [] : [
      createElement('label', { className: 'form-field' }, 'Tu nombre', createElement('input', {
        name: 'name', type: 'text', autocomplete: 'name', required: 'true', placeholder: 'Ej. Ana',
      })),
    ];

    form.replaceChildren(
      createElement('p', { className: 'eyebrow' }, 'Tu escritorio personal'),
      createElement('h1', {}, isLogin ? 'Qué bueno verte.' : 'Empieza tu colección.'),
      createElement('p', { className: 'form-intro' }, isLogin
        ? 'Entra y vuelve a tus ideas favoritas.'
        : 'Crea un rincón para guardar todo lo que te inspira.'),
      ...nameField,
      createElement('label', { className: 'form-field' }, 'Correo electrónico', createElement('input', {
        name: 'email', type: 'email', autocomplete: 'email', required: 'true', placeholder: 'tu@correo.com',
      })),
      createElement('label', { className: 'form-field' }, 'Contraseña', createElement('input', {
        name: 'password', type: 'password', autocomplete: isLogin ? 'current-password' : 'new-password', required: 'true', placeholder: '••••••••',
      })),
      createElement('button', { type: 'submit', className: 'auth-submit' }, isLogin ? 'Entrar a mis notas' : 'Crear mi cuenta'),
      status,
    );
    modeButton.textContent = isLogin ? '¿Todavía no tienes cuenta? Regístrate' : 'Ya tengo una cuenta';
  }

  modeButton.addEventListener('click', () => {
    mode = mode === 'login' ? 'register' : 'login';
    status.textContent = '';
    renderForm();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const credentials = Object.fromEntries(formData.entries());

    try {
      if (mode === 'login') {
        await authService.login(credentials);
      } else {
        await authService.register(credentials);
      }
      document.querySelector('#app').classList.remove('landing-shell');
      window.history.pushState({}, '', '/notes');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      status.textContent = error.message;
    }
  });

  renderForm();
  formPanel.append(form, modeButton);
  section.append(
    createElement('div', { className: 'welcome-copy' },
      createElement('span', { className: 'brand-mark' }, 'heyNotes'),
      createElement('p', { className: 'welcome-kicker' }, 'Notas para días con ideas'),
      createElement('h2', {}, 'Escribe lo que no quieres olvidar.'),
      createElement('p', {}, 'Un espacio tranquilo, hecho para tus pensamientos, listas y pequeños descubrimientos.'),
    ),
    formPanel,
  );
  return section;
}

