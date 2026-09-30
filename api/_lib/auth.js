import { randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { getDb } from './db.js';

const SESSION_COOKIE = 'heynotes_session';
const SESSION_DAYS = 7;

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator === -1) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function cookieOptions(maxAge) {
  const secure = process.env.VERCEL === '1' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setSessionCookie(res, token) {
  const secure = process.env.VERCEL === '1' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${secure}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookieOptions(0));
}

export async function createSession(res, userId) {
  const db = await getDb();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.collection('sessions').insertOne({ token, userId: new ObjectId(userId), createdAt: new Date(), expiresAt });
  setSessionCookie(res, token);
}

export async function getAuthenticatedUser(req) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection('sessions').findOne({
    token,
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const user = await db.collection('users').findOne({ _id: session.userId });
  if (!user) return null;

  return { id: user._id.toString(), name: user.name, email: user.email };
}

export async function destroySession(req, res) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (token) {
    const db = await getDb();
    await db.collection('sessions').deleteOne({ token });
  }
  clearSessionCookie(res);
}

export function sendMethodNotAllowed(res) {
  res.setHeader('Allow', 'POST');
  return res.status(405).json({ error: 'Método no permitido.' });
}
