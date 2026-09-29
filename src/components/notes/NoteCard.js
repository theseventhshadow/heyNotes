import { createElement } from '../../utils/dom.js';

export function NoteCard(note) {
  return createElement(
    'article',
    { className: 'card note-card' },
    createElement('h3', {}, note.title),
    createElement('p', {}, note.content),
    createElement('small', {}, new Date(note.createdAt).toLocaleDateString('es-ES')),
  );
}
