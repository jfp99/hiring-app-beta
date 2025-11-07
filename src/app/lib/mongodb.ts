// src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';
import { getMongoConfig } from './env';
import { logger } from './logger';

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
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      logger.debug('Initiating MongoDB connection', { database: MONGODB_DB });

      cached.promise = MongoClient.connect(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }).then((client) => {
        logger.info('MongoDB connection established successfully', { database: MONGODB_DB });
        return {
          client,
          db: client.db(MONGODB_DB),
        };
      }).catch((error) => {
        logger.error('MongoDB connection failed', {
          database: MONGODB_DB,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, error as Error);
        // Reset the cached promise so next attempt will try again
        cached.promise = null;
        throw error;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    logger.error('Failed to connect to database', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);

    // Create a user-friendly error
    const dbError = new Error('Database connection failed. Please check MongoDB configuration.');
    dbError.name = 'DatabaseConnectionError';
    throw dbError;
  }
}