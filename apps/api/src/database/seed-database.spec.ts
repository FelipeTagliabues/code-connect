import { count, isNull } from 'drizzle-orm';
import { createTestDatabase } from '../../test/create-test-database.js';
import type { Database } from './database.constants.js';
import { comments, posts, users } from './schema.js';
import { seedAuthors, seedPosts } from './seed-data.js';
import { seedDatabase } from './seed-database.js';

describe('seedDatabase', () => {
  let db: Database;
  let close: () => Promise<void>;

  beforeEach(async () => {
    const database = await createTestDatabase();
    db = database.db;
    close = database.close;
  });

  afterEach(async () => {
    await close();
  });

  const countRows = async (table: typeof users | typeof posts) => {
    const [{ total }] = await db.select({ total: count() }).from(table);
    return total;
  };

  it('creates authors, posts with and without thumbnail and comments', async () => {
    await seedDatabase(db);

    expect(await countRows(users)).toBe(seedAuthors.length);
    expect(await countRows(posts)).toBe(seedPosts.length);

    const withoutThumbnail = await db
      .select({ total: count() })
      .from(posts)
      .where(isNull(posts.thumbnailUrl));
    expect(withoutThumbnail[0].total).toBeGreaterThan(0);

    const [{ total: commentsCount }] = await db
      .select({ total: count() })
      .from(comments);
    expect(commentsCount).toBeGreaterThan(0);
  });

  it('does not duplicate data or touch other users when run twice', async () => {
    const [other] = await db
      .insert(users)
      .values({
        name: 'Outra Pessoa',
        email: 'outra@email.com',
        phone: '11987654321',
        passwordHash: 'hash',
      })
      .returning();
    await db.insert(posts).values({
      authorId: other.id,
      title: 'Post de outra pessoa',
      description: 'Não pode sumir',
    });

    await seedDatabase(db);
    await seedDatabase(db);

    expect(await countRows(users)).toBe(seedAuthors.length + 1);
    expect(await countRows(posts)).toBe(seedPosts.length + 1);
  });
});
