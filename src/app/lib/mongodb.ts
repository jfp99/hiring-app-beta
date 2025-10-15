// src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';
import { getMongoConfig } from './env';

// Get validated MongoDB configuration
const { uri: MONGODB_URI, database: MONGODB_DB } = getMongoConfig();

export interface MongoConnection {
  client: MongoClient;
  db: Db;
}

interface CachedMongo {
  conn: MongoConnection | null;
  promise: Promise<MongoConnection> | null;
}

declare global {
  var mongo: CachedMongo | undefined;
}

const cached: CachedMongo = global.mongo || { conn: null, promise: null };

if (!global.mongo) {
  global.mongo = cached;
}

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}