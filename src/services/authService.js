import * as cryptoService from './cryptoService.js';

let currentUser = null;

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'No se pudo completar la solicitud.');
  return data;
}

export const authService = {
  getCurrentUser() {
    return currentUser;
  },

  async restoreSession() {
    try {
      const data = await request('/api/auth/me');
      currentUser = data.user;
    } catch {
      currentUser = null;
    }
    return currentUser;
  },

  async register(credentials) {
    const encryptionMetadata = await cryptoService.createEncryptionMetadata(credentials.password);
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, ...encryptionMetadata }),
    });
    currentUser = data.user;
    return currentUser;
  },

  async login(credentials) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    currentUser = data.user;
    try {
      await this.unlockEncryption(credentials.password);
    } catch (error) {
      await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
      currentUser = null;
      cryptoService.clearEncryptionKey();
      throw new Error('No se pudieron desbloquear tus notas. Comprueba tu contraseña.');
    }
    return currentUser;
  },

  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    cryptoService.clearEncryptionKey();
  },

  async updateProfile(details) {
    const data = await request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'details', ...details }),
    });
    currentUser = data.user;
    return currentUser;
  },

  async changePassword(credentials) {
    if (!cryptoService.isUnlocked()) await this.unlockEncryption(credentials.currentPassword);
    const encryptionMetadata = await cryptoService.preparePasswordChange(credentials.newPassword);
    const data = await request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'password', ...credentials, ...encryptionMetadata }),
    });
    currentUser = data.user;
    return currentUser;
  },

  async updateTheme(theme) {
    const data = await request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'theme', theme }),
    });
    currentUser = data.user;
    return currentUser;
  },

  async unlockEncryption(password) {
    const encryptionMetadata = await cryptoService.unlockEncryption(password, currentUser);
    if (currentUser.encryptedDataKey) return currentUser;

    const data = await request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'encryption-init',
        currentPassword: password,
        ...encryptionMetadata,
      }),
    });
    currentUser = data.user;
    if (currentUser.encryptedDataKey !== encryptionMetadata.encryptedDataKey) {
      cryptoService.clearEncryptionKey();
      await cryptoService.unlockEncryption(password, currentUser);
    }
    return currentUser;
  },
};