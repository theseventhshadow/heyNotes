import { decryptText, encryptText } from './cryptoService.js';

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

async function encryptNote(note) {
  return {
    title: await encryptText(note.title),
    content: await encryptText(note.content || ''),
    encryptionVersion: 1,
  };
}

async function decryptNote(note) {
  return {
    ...note,
    title: await decryptText(note.title),
    content: await decryptText(note.content),
  };
}

async function migrateLegacyNote(note) {
  const encrypted = await encryptNote(note);
  const data = await request(`/api/notes/${note.id}`, {
    method: 'PUT',
    body: JSON.stringify(encrypted),
  });
  return { ...data.note, title: note.title, content: note.content };
}

export const notesService = {
  async getAll() {
    const data = await request('/api/notes');
    return Promise.all(data.notes.map((note) => (
      note.encryptionVersion === 1 ? decryptNote(note) : migrateLegacyNote(note)
    )));
  },

  async create(note) {
    const encrypted = await encryptNote(note);
    const data = await request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(encrypted),
    });
    return { ...data.note, title: note.title, content: note.content || '' };
  },

  async update(id, changes) {
    const encrypted = await encryptNote(changes);
    const data = await request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(encrypted),
    });
    return { ...data.note, title: changes.title, content: changes.content || '' };
  },

  async delete(id) {
    await request(`/api/notes/${id}`, { method: 'DELETE' });
  },
};
