import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';

function serializeNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    encryptionVersion: note.encryptionVersion || 0,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export default async function handler(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Necesitas iniciar sesión.' });

    const noteId = req.query.id;
    if (!ObjectId.isValid(noteId)) return res.status(400).json({ error: 'Identificador de nota inválido.' });

    const db = await getDb();
    const filter = { _id: new ObjectId(noteId), userId: new ObjectId(user.id) };

    if (req.method === 'PUT') {
      const { title, content = '', encryptionVersion } = req.body || {};
      if (encryptionVersion !== 1 || typeof title !== 'string' || typeof content !== 'string') {
        return res.status(400).json({ error: 'La nota debe enviarse cifrada.' });
      }
      if (!title) return res.status(400).json({ error: 'El título es obligatorio.' });

      const updatedAt = new Date();
      const result = await db.collection('notes').findOneAndUpdate(
        filter,
        { $set: { title, content, encryptionVersion: 1, updatedAt } },
        { returnDocument: 'after' },
      );
      if (!result) return res.status(404).json({ error: 'Nota no encontrada.' });
      return res.status(200).json({ note: serializeNote(result) });
    }

    if (req.method === 'DELETE') {
      const result = await db.collection('notes').deleteOne(filter);
      if (!result.deletedCount) return res.status(404).json({ error: 'Nota no encontrada.' });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo procesar la nota.' });
  }
}
