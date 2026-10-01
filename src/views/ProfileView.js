import { createElement } from '../utils/dom.js';
import { authService } from '../services/authService.js';

function createField(label, properties) {
  return createElement('label', { className: 'profile-form__field' }, label, createElement('input', properties));
}

export function ProfileView() {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return createElement(
      'section',
      { className: 'not-found-view' },
      createElement('h1', {}, 'Necesitas iniciar sesión'),
      createElement('p', {}, 'Entra a tu cuenta para editar tu perfil.'),
      createElement('a', { href: '/', className: 'button-link' }, 'Ir al inicio'),
    );
  }

  const section = createElement('section', { className: 'profile-view' });
  const detailsForm = createElement('form', { className: 'profile-form' });
  const detailsStatus = createElement('p', { className: 'profile-status', role: 'status' });
  const passwordForm = createElement('form', { className: 'profile-form' });
  const passwordStatus = createElement('p', { className: 'profile-status', role: 'status' });

  detailsForm.append(
    createElement('p', { className: 'eyebrow' }, 'Datos personales'),
    createElement('h2', {}, 'Tu identidad'),
    createElement('p', { className: 'profile-form__intro' }, 'Confirma tu contraseña actual para guardar estos cambios.'),
    createField('Nombre de usuario', {
      name: 'name', type: 'text', autocomplete: 'name', required: 'true', value: currentUser.name,
    }),
    createField('Correo electrónico', {
      name: 'email', type: 'email', autocomplete: 'email', required: 'true', value: currentUser.email,
    }),
    createField('Contraseña actual', {
      name: 'currentPassword', type: 'password', autocomplete: 'current-password', required: 'true',
    }),
    createElement('button', { type: 'submit', className: 'profile-form__submit' }, 'Guardar datos'),
    detailsStatus,
  );

  passwordForm.append(
    createElement('p', { className: 'eyebrow' }, 'Seguridad'),
    createElement('h2', {}, 'Cambiar contraseña'),
    createElement('p', { className: 'profile-form__intro' }, 'Necesitarás tu contraseña actual y confirmar la nueva.'),
    createField('Contraseña actual', {
      name: 'currentPassword', type: 'password', autocomplete: 'current-password', required: 'true',
    }),
    createField('Nueva contraseña', {
      name: 'newPassword', type: 'password', autocomplete: 'new-password', minlength: '8', required: 'true',
    }),
    createField('Repite la nueva contraseña', {
      name: 'confirmPassword', type: 'password', autocomplete: 'new-password', minlength: '8', required: 'true',
    }),
    createElement('button', { type: 'submit', className: 'profile-form__submit' }, 'Actualizar contraseña'),
    passwordStatus,
  );

  detailsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    detailsStatus.textContent = '';
    const values = Object.fromEntries(new FormData(detailsForm).entries());

    try {
      const user = await authService.updateProfile(values);
      detailsForm.elements.currentPassword.value = '';
      detailsStatus.className = 'profile-status profile-status--success';
      detailsStatus.textContent = 'Datos actualizados.';
      section.querySelector('.profile-view__heading h1').textContent = `Perfil de ${user.name}`;
    } catch (error) {
      detailsStatus.className = 'profile-status';
      detailsStatus.textContent = error.message;
    }
  });

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    passwordStatus.textContent = '';
    const values = Object.fromEntries(new FormData(passwordForm).entries());

    try {
      await authService.changePassword(values);
      passwordForm.reset();
      passwordStatus.className = 'profile-status profile-status--success';
      passwordStatus.textContent = 'Contraseña actualizada.';
    } catch (error) {
      passwordStatus.className = 'profile-status';
      passwordStatus.textContent = error.message;
    }
  });

  section.append(
    createElement('div', { className: 'profile-view__heading' },
      createElement('div', {},
        createElement('p', { className: 'eyebrow' }, 'Cuenta'),
        createElement('h1', {}, `Perfil de ${currentUser.name}`),
        createElement('p', {}, 'Mantén tus datos al día y protege el acceso a tus notas.'),
      ),
      createElement('a', { href: '/notes', className: 'button-link' }, 'Volver a mis notas'),
    ),
    createElement('div', { className: 'profile-grid' },
      createElement('div', { className: 'profile-panel card' }, detailsForm),
      createElement('div', { className: 'profile-panel card' }, passwordForm),
    ),
  );
  return section;
}