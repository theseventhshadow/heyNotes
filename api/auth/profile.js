import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';

function serializeUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) return res.status(401).json({ error: 'Necesitas iniciar sesión.' });

    const { action, currentPassword } = req.body || {};
    if (!currentPassword) return res.status(400).json({ error: 'La contraseña actual es obligatoria.' });

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(authenticatedUser.id) });
    const passwordMatches = user && await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatches) return res.status(401).json({ error: 'La contraseña actual no es correcta.' });

    if (action === 'details') {
      const { name, email } = req.body || {};
      const normalizedName = name?.trim();
      const normalizedEmail = email?.trim().toLowerCase();

      if (!normalizedName || !normalizedEmail) {
        return res.status(400).json({ error: 'El nombre y el correo son obligatorios.' });
      }

      const result = await users.findOneAndUpdate(
        { _id: user._id },
        { $set: { name: normalizedName, email: normalizedEmail } },
        { returnDocument: 'after' },
      );
      return res.status(200).json({ user: serializeUser(result) });
    }

    if (action === 'password') {
      const { newPassword, confirmPassword } = req.body || {};
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Las nuevas contraseñas no coinciden.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await users.updateOne({ _id: user._id }, { $set: { passwordHash } });
      return res.status(200).json({ message: 'Contraseña actualizada.' });
    }

    return res.status(400).json({ error: 'Operación de perfil no válida.' });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Ese correo ya está registrado.' });
    console.error(error);
    return res.status(500).json({ error: 'No se pudo actualizar el perfil.' });
  }
}