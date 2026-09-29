import { storage } from '../utils/storage.js';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

export const authService = {
  getCurrentUser() {
    return storage.get(SESSION_KEY);
  },

  register({ name, email, password }) {
    const users = storage.get(USERS_KEY, []);
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const user = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, password };
    storage.set(USERS_KEY, [...users, user]);
    storage.set(SESSION_KEY, { id: user.id, name: user.name, email: user.email });
    return user;
  },

  login({ email, password }) {
    const users = storage.get(USERS_KEY, []);
    const user = users.find(
      (candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password,
    );

    if (!user) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    storage.set(SESSION_KEY, { id: user.id, name: user.name, email: user.email });
    return user;
  },

  logout() {
    storage.remove(SESSION_KEY);
  },
};