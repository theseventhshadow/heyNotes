import { getAuthenticatedUser, sendMethodNotAllowed } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendMethodNotAllowed(res);

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Sesión no válida.' });
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo recuperar la sesión.' });
  }
}
