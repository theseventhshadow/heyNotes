import { createElement } from '../utils/dom.js';
import { authService } from '../services/authService.js';
import { notesService } from '../services/notesService.js';
import { NoteCard } from '../components/notes/NoteCard.js';
import { isUnlocked } from '../services/cryptoService.js';

function createUnlockView() {
  const section = createElement('section', { className: 'not-found-view' });
  const form = createElement('form', { className: 'auth-form' });
  const status = createElement('p', { className: 'auth-status', role: 'status' });
  const password = createElement('input', {
    name: 'password', type: 'password', autocomplete: 'current-password', required: 'true',
  });

  form.append(
    createElement('p', { className: 'eyebrow' }, 'Notas protegidas'),
    createElement('h1', {}, 'Desbloquea tus notas'),
    createElement('p', { className: 'form-intro' }, 'Introduce tu contraseña para descifrarlas en este dispositivo.'),
    createElement('label', { className: 'form-field' }, 'Contraseña', password),
    createElement('button', { type: 'submit', className: 'auth-submit' }, 'Desbloquear'),
    status,
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    try {
      await authService.unlockEncryption(password.value);
      section.replaceWith(NotesView());
    } catch {
      status.textContent = 'No se pudieron desbloquear las notas. Comprueba tu contraseña.';
    }
  });

  section.append(form);
  return section;
}

export function NotesView() {
  if (!authService.getCurrentUser()) {
    return createElement(
      'section',
      { className: 'not-found-view' },
      createElement('h1', {}, 'Necesitas iniciar sesión'),
      createElement('p', {}, 'Entra a tu cuenta para consultar tus notas.'),
      createElement('a', { href: '/', className: 'button-link' }, 'Ir al inicio'),
    );
  }

  if (!isUnlocked()) return createUnlockView();

  const section = createElement('section', { className: 'notes-workspace' });
  const notes = [];
  let selectedNote = null;
  const noteList = createElement('div', { className: 'notes-list' });
  const editor = createElement('section', { className: 'note-paper' });
  const titleInput = createElement('input', {
    className: 'note-title-input', type: 'text', placeholder: 'Título de la nota',
  });
  const contentInput = createElement('textarea', {
    className: 'note-content-input', placeholder: 'Escribe aquí tus ideas...', rows: '14',
  });
  const saveButton = createElement('button', { type: 'button', className: 'save-note-button' }, 'Guardar nota');
  const deleteButton = createElement('button', {
    type: 'button', className: 'delete-note-button', disabled: 'true',
  }, 'Eliminar nota');
  const newButton = createElement('button', { type: 'button', className: 'new-note-button' }, '+ Nueva nota');
  const feedback = createElement('span', { className: 'note-feedback', role: 'status' });
  const confirmDialog = createElement('dialog', { className: 'confirm-dialog' });
  const cancelDeleteButton = createElement('button', {
    type: 'button', className: 'cancel-delete-button',
  }, 'Cancelar');
  const confirmDeleteButton = createElement('button', {
    type: 'button', className: 'confirm-delete-button',
  }, 'Sí, eliminar');

  function selectNote(note) {
    selectedNote = note;
    titleInput.value = note.title;
    contentInput.value = note.content;
    saveButton.textContent = 'Actualizar nota';
    deleteButton.disabled = false;
    renderList();
  }

  function startNewNote() {
    selectedNote = null;
    titleInput.value = '';
    contentInput.value = '';
    saveButton.textContent = 'Guardar nota';
    deleteButton.disabled = true;
    feedback.textContent = '';
    renderList();
    titleInput.focus();
  }

  function renderList() {
    noteList.replaceChildren(
      createElement('div', { className: 'notes-list__header' },
        createElement('div', {},
          createElement('p', { className: 'eyebrow' }, 'Archivo'),
          createElement('h1', {}, 'Mis notas'),
        ),
        newButton,
      ),
    );

    if (notes.length === 0) {
      noteList.append(createElement('p', { className: 'empty-notes' }, 'Tus notas aparecerán aquí.'));
      return;
    }

    notes.forEach((note) => noteList.append(
      NoteCard(note, { onSelect: selectNote, selected: selectedNote?.id === note.id }),
    ));
  }

  newButton.addEventListener('click', startNewNote);
  saveButton.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title) {
      feedback.textContent = 'Escribe un título para guardar la nota.';
      titleInput.focus();
      return;
    }

    if (selectedNote) {
      if (selectedNote.title === title && (selectedNote.content || '') === content) {
        feedback.textContent = 'No hay cambios para guardar.';
        return;
      }

      const updatedAt = new Date().toISOString();
      await notesService.update(selectedNote.id, {
        title, content, updatedAt,
      });
      selectedNote = { ...selectedNote, title, content, updatedAt };
      const noteIndex = notes.findIndex((note) => note.id === selectedNote.id);
      notes[noteIndex] = selectedNote;
      feedback.textContent = 'Nota actualizada.';
    } else {
      const note = await notesService.create({ title, content });
      notes.unshift(note);
      selectedNote = note;
      saveButton.textContent = 'Actualizar nota';
      feedback.textContent = 'Nota guardada.';
    }
    renderList();
  });

  deleteButton.addEventListener('click', () => {
    if (selectedNote) {
      confirmDialog.showModal();
    }
  });

  cancelDeleteButton.addEventListener('click', () => confirmDialog.close());
  confirmDeleteButton.addEventListener('click', async () => {
    if (!selectedNote) {
      return;
    }

    await notesService.delete(selectedNote.id);
    const deletedNoteId = selectedNote.id;
    const noteIndex = notes.findIndex((note) => note.id === deletedNoteId);
    notes.splice(noteIndex, 1);
    confirmDialog.close();
    startNewNote();
    feedback.textContent = 'Nota eliminada.';
  });

  notesService.getAll().then((savedNotes) => {
    notes.push(...savedNotes);
    renderList();
  });

  const editorColumn = createElement('div', { className: 'note-editor-column' });
  const editorToolbar = createElement('div', { className: 'note-editor-toolbar' },
    createElement('span', {}, 'Acciones de la nota'),
    createElement('div', { className: 'paper-actions' }, saveButton, deleteButton),
  );

  editor.append(
    createElement('div', { className: 'paper-topline' },
      createElement('span', {}, 'heyNotes / cuaderno'),
      feedback,
    ),
    titleInput,
    contentInput,
  );
  confirmDialog.append(
    createElement('p', { className: 'eyebrow' }, 'Borrar nota'),
    createElement('h2', {}, '¿Eliminar esta nota?'),
    createElement('p', {}, 'Esta acción no se puede deshacer.'),
    createElement('div', { className: 'dialog-actions' }, cancelDeleteButton, confirmDeleteButton),
  );
  editorColumn.append(editorToolbar, editor);
  section.append(noteList, editorColumn, confirmDialog);
  return section;
}
