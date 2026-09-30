import { createElement } from '../../utils/dom.js';

function formatLastModified(note) {
  return new Date(note.updatedAt || note.createdAt).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function NoteCard(note, { onSelect, selected = false } = {}) {
  return createElement(
    'button',
    {
      type: 'button',
      className: `note-card${selected ? ' note-card--selected' : ''}`,
      onClick: () => onSelect?.(note),
    },
    createElement('h3', {}, note.title),
    createElement('p', {}, note.content || 'Sin contenido'),
    createElement('small', {}, `Última modificación: ${formatLastModified(note)}`),
  );
}
