import bcrypt from 'bcryptjs';
import { getDb } from '../_lib/db.js';
import { createSession, sendMethodNotAllowed } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendMethodNotAllowed(res);

  try {
    const { email, password } = req.body || {};
    const normalizedEmail = email?.trim().toLowerCase();
    const db = await getDb();
    const user = normalizedEmail ? await db.collection('users').findOne({ email: normalizedEmail }) : null;
    const passwordMatches = user ? await bcrypt.compare(password || '', user.passwordHash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    await createSession(res, user._id.toString());
    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        theme: user.theme || 'light',
        encryptionSalt: user.encryptionSalt,
        encryptedDataKey: user.encryptedDataKey,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
}
