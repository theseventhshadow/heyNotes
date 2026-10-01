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
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
    return currentUser;
  },

  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
    currentUser = null;
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
    return request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'password', ...credentials }),
    });
  },

  async updateTheme(theme) {
    const data = await request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'theme', theme }),
    });
    currentUser = data.user;
    return currentUser;
  },
};