import { hash } from 'bcryptjs';
import { inArray, sql } from 'drizzle-orm';
import type { Database } from './database.constants.js';
import { comments, postLikes, posts, users } from './schema.js';
import {
  BROKEN_THUMBNAIL_URL,
  SEED_PASSWORD,
  seedAuthors,
  seedComments,
  seedPosts,
  seedReplies,
} from './seed-data.js';

const HOUR = 60 * 60 * 1000;
const THUMBNAIL_COUNT = 6;

/** A cada 4 posts, um fica sem thumbnail; o segundo tem uma URL quebrada. */
function thumbnailFor(index: number): string | null {
  if (index === 1) return BROKEN_THUMBNAIL_URL;
  if (index % 4 === 3) return null;
  return `/posts/post-${(index % THUMBNAIL_COUNT) + 1}.png`;
}

/** Pode rodar de novo: só recria os posts dos autores do seed. */
export async function seedDatabase(db: Database): Promise<void> {
  const passwordHash = await hash(SEED_PASSWORD, 10);

  await db.transaction(async (tx) => {
    const authors = await tx
      .insert(users)
      .values(
        seedAuthors.map((author) => ({
          ...author,
          phone: '11987654321',
          passwordHash,
        })),
      )
      .onConflictDoUpdate({
        target: users.email,
        set: { name: sql`excluded.name` },
      })
      .returning({ id: users.id });
    const authorIds = authors.map((author) => author.id);
    const authorAt = (index: number) => authorIds[index % authorIds.length];

    await tx.delete(posts).where(inArray(posts.authorId, authorIds));

    const now = Date.now();
    const created = await tx
      .insert(posts)
      .values(
        seedPosts.map((post, index) => ({
          ...post,
          authorId: authorAt(index),
          thumbnailUrl: thumbnailFor(index),
          createdAt: new Date(now - index * 6 * HOUR),
        })),
      )
      .returning({ id: posts.id, createdAt: posts.createdAt });

    await tx
      .insert(postLikes)
      .values(
        created.flatMap((post, index) =>
          authorIds
            .slice(0, (index * 5) % (authorIds.length + 1))
            .map((userId) => ({ postId: post.id, userId })),
        ),
      );

    for (const [index, post] of created.entries()) {
      const threads = (index + 2) % (seedComments.length - 1);
      for (let thread = 0; thread < threads; thread += 1) {
        const threadAt = post.createdAt.getTime() + (thread + 1) * HOUR;
        const [root] = await tx
          .insert(comments)
          .values({
            postId: post.id,
            authorId: authorAt(index + thread + 1),
            content: seedComments[(index + thread) % seedComments.length],
            createdAt: new Date(threadAt),
          })
          .returning({ id: comments.id });

        if (thread % 2 === 1) {
          await tx.insert(comments).values({
            postId: post.id,
            parentId: root.id,
            authorId: authorAt(index),
            content: seedReplies[(index + thread) % seedReplies.length],
            createdAt: new Date(threadAt + HOUR / 2),
          });
        }
      }
    }
  });
}
