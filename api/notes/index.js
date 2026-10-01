import { getDb } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';
import { ObjectId } from 'mongodb';

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

    const db = await getDb();
    const userId = new ObjectId(user.id);

    if (req.method === 'GET') {
      const notes = await db.collection('notes')
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();
      return res.status(200).json({ notes: notes.map(serializeNote) });
    }

    if (req.method === 'POST') {
      const { title, content = '', encryptionVersion } = req.body || {};
      if (encryptionVersion !== 1 || typeof title !== 'string' || typeof content !== 'string') {
        return res.status(400).json({ error: 'La nota debe enviarse cifrada.' });
      }
      if (!title) return res.status(400).json({ error: 'El título es obligatorio.' });

      const now = new Date();
      const note = {
        userId,
        title,
        content,
        encryptionVersion: 1,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection('notes').insertOne(note);
      return res.status(201).json({ note: serializeNote({ ...note, _id: result.insertedId }) });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudieron cargar las notas.' });
  }
}
