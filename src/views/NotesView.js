import { createElement } from '../utils/dom.js';
import { notesService } from '../services/notesService.js';
import { NoteCard } from '../components/notes/NoteCard.js';

export function NotesView() {
  const section = createElement('section', { className: 'notes-view' });
  const heading = createElement('h1', {}, 'Mis notas');
  const grid = createElement('div', { className: 'notes-grid' });

  notesService.getAll().then((notes) => {
    if (notes.length === 0) {
      grid.append(createElement('p', {}, 'Todavía no tienes notas.'));
      return;
    }

    notes.forEach((note) => grid.append(NoteCard(note)));
  });

  section.append(heading, grid);
  return section;
}
