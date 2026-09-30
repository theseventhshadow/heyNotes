import { authService } from './authService.js';
import { storage } from '../utils/storage.js';

const NOTES_KEY = 'notes';

function getStoredNotes() {
  return storage.get(NOTES_KEY, []);
}

function getCurrentUserId() {
  return authService.getCurrentUser()?.id;
}

export const notesService = {
  async getAll() {
    const userId = getCurrentUserId();
    return getStoredNotes().filter((note) => note.userId === userId);
  },

  async create(note) {
    const userId = getCurrentUserId();
    const newNote = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      ...note,
    };

    storage.set(NOTES_KEY, [...getStoredNotes(), newNote]);
    return newNote;
  },

  async delete(id) {
    const userId = getCurrentUserId();
    const notes = getStoredNotes().filter(
      (note) => !(note.id === id && note.userId === userId),
    );
    storage.set(NOTES_KEY, notes);
  },

  async update(id, changes) {
    const userId = getCurrentUserId();
    const notes = getStoredNotes().map((note) => (
      note.id === id && note.userId === userId ? { ...note, ...changes } : note
    ));
    storage.set(NOTES_KEY, notes);
  },
};
