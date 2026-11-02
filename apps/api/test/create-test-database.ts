import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { fileURLToPath } from 'node:url';
import type { Database } from '../src/database/database.constants.js';
import * as schema from '../src/database/schema.js';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

let migratedSnapshot: ReturnType<PGlite['dumpDataDir']> | undefined;

async function createMigratedSnapshot() {
  const client = new PGlite();
  await migrate(drizzle(client, { schema }), { migrationsFolder });
  const snapshot = await client.dumpDataDir('none');
  await client.close();
  return snapshot;
}

/** Migra uma vez por arquivo de teste e clona o resultado: subir do zero a cada teste estoura os hooks quando as suítes rodam em paralelo. */
export async function createTestDatabase() {
  migratedSnapshot ??= createMigratedSnapshot();
  const client = new PGlite({ loadDataDir: await migratedSnapshot });
  const db = drizzle(client, { schema });
  return {
    db: db as unknown as Database,
    close: () => client.close(),
  };
}
