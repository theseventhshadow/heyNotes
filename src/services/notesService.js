const notes = [];

export const notesService = {
  async getAll() {
    return [...notes];
  },

  async create(note) {
    const newNote = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...note,
    };

    notes.push(newNote);
    return newNote;
  },

  async delete(id) {
    const noteIndex = notes.findIndex((note) => note.id === id);
    if (noteIndex !== -1) {
      notes.splice(noteIndex, 1);
    }
  },
};
