import bcrypt from 'bcryptjs';
import { getDb } from '../_lib/db.js';
import { createSession, sendMethodNotAllowed } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendMethodNotAllowed(res);

  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = email?.trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password || password.length < 8) {
      return res.status(400).json({ error: 'Nombre, correo y una contraseña de al menos 8 caracteres son obligatorios.' });
    }

    const db = await getDb();
    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      theme: 'light',
      createdAt: new Date(),
    };
    const result = await db.collection('users').insertOne(user);
    await createSession(res, result.insertedId.toString());

    return res.status(201).json({ user: { id: result.insertedId.toString(), name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    console.error(error);
    return res.status(500).json({ error: 'No se pudo crear la cuenta.' });
  }
}
