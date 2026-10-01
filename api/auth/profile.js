import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    theme: user.theme || 'light',
    encryptionSalt: user.encryptionSalt,
    encryptedDataKey: user.encryptedDataKey,
  };
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
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(authenticatedUser.id) });

    if (action === 'encryption-init') {
      const { encryptionSalt, encryptedDataKey } = req.body || {};
      if (!encryptionSalt || !encryptedDataKey) {
        return res.status(400).json({ error: 'Faltan los datos de cifrado.' });
      }

      const result = await users.findOneAndUpdate(
        { _id: user._id, encryptionSalt: { $exists: false }, encryptedDataKey: { $exists: false } },
        { $set: { encryptionSalt, encryptedDataKey } },
        { returnDocument: 'after' },
      );
      return res.status(200).json({ user: serializeUser(result || user) });
    }

    if (action === 'theme') {
      const { theme } = req.body || {};
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ error: 'Tema no válido.' });
      }

      const result = await users.findOneAndUpdate(
        { _id: user._id },
        { $set: { theme } },
        { returnDocument: 'after' },
      );
      return res.status(200).json({ user: serializeUser(result) });
    }

    if (!currentPassword) return res.status(400).json({ error: 'La contraseña actual es obligatoria.' });

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

      const { encryptionSalt, encryptedDataKey } = req.body || {};
      if (!encryptionSalt || !encryptedDataKey) {
        return res.status(400).json({ error: 'Debes desbloquear tus notas antes de cambiar la contraseña.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      const result = await users.findOneAndUpdate(
        { _id: user._id },
        { $set: { passwordHash, encryptionSalt, encryptedDataKey } },
        { returnDocument: 'after' },
      );
      return res.status(200).json({ user: serializeUser(result) });
    }

    return res.status(400).json({ error: 'Operación de perfil no válida.' });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Ese correo ya está registrado.' });
    console.error(error);
    return res.status(500).json({ error: 'No se pudo actualizar el perfil.' });
  }
}