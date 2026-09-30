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

export const notesService = {
  async getAll() {
    const data = await request('/api/notes');
    return data.notes;
  },

  async create(note) {
    const data = await request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
    return data.note;
  },

  async update(id, changes) {
    const data = await request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    return data.note;
  },

  async delete(id) {
    await request(`/api/notes/${id}`, { method: 'DELETE' });
  },
};
