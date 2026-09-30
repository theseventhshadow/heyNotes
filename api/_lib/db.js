import { MongoClient } from 'mongodb';

let cached = globalThis.__heyNotesMongo;

if (!cached) {
  cached = globalThis.__heyNotesMongo = {
    client: null,
    promise: null,
    indexesReady: false,
  };
}

export async function getDb() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurada.');
  }

  if (!cached.promise) {
    cached.client = new MongoClient(process.env.MONGODB_URI);
    cached.promise = cached.client.connect();
  }

  const client = await cached.promise;
  const db = client.db(process.env.MONGODB_DB || 'heynotes');

  if (!cached.indexesReady) {
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection('notes').createIndex({ userId: 1, updatedAt: -1 }),
    ]);
    cached.indexesReady = true;
  }

  return db;
}
