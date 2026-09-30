import { destroySession, sendMethodNotAllowed } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendMethodNotAllowed(res);

  try {
    await destroySession(req, res);
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo cerrar la sesión.' });
  }
}
