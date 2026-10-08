import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { defineRelations } from 'drizzle-orm/relations';

const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

const relations = defineRelations(schema);

export const db = drizzle({ client: pool, relations });
