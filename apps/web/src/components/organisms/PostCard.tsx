import { Link } from 'react-router'
import { resolveImageUrl, type Post } from '../../services/posts.ts'
import { Tag } from '../atoms/Tag.tsx'
import { PostStat } from '../molecules/PostStat.tsx'
import { PostThumbnail } from '../molecules/PostThumbnail.tsx'
import { UserBadge } from '../molecules/UserBadge.tsx'

type PostCardProps = {
  post: Post
  variant?: 'feed' | 'detail'
  onLike: (post: Post) => void
  onShare: (post: Post) => void
}

export function PostCard({ post, variant = 'feed', onLike, onShare }: PostCardProps) {
  const isFeed = variant === 'feed'
  const postUrl = `/posts/${post.id}`
  const thumbnail = (
    <PostThumbnail
      src={resolveImageUrl(post.thumbnailUrl)}
      alt={`Capa do post ${post.title}`}
      size={variant}
    />
  )

  return (
    <article className="flex h-full flex-col">
      {isFeed ? (
        // O título já é o link acessível; a imagem é só um atalho para o mouse.
        <Link to={postUrl} tabIndex={-1} aria-hidden="true">
          {thumbnail}
        </Link>
      ) : (
        thumbnail
      )}

      <div className="flex flex-1 flex-col gap-4 rounded-b-lg bg-card p-4">
        <div className="flex flex-col gap-2 break-words text-cinza-claro">
          {isFeed ? (
            <h2 className="text-lg font-semibold">
              <Link
                to={postUrl}
                className="hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                {post.title}
              </Link>
            </h2>
          ) : (
            <h1 className="text-2xl font-semibold">{post.title}</h1>
          )}
          <p className={`text-sm ${isFeed ? 'line-clamp-3' : 'whitespace-pre-line'}`}>
            {post.description}
          </p>
        </div>

        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <PostStat
              icon="code"
              label="Curtir"
              count={post.likesCount}
              pressed={post.likedByMe}
              onClick={() => onLike(post)}
            />
            <PostStat icon="share" label="Compartilhar" onClick={() => onShare(post)} />
            <PostStat
              icon="chat"
              label="Comentários"
              count={post.commentsCount}
              to={`${postUrl}#comentarios`}
            />
          </div>
          <UserBadge name={post.author.name} />
        </div>
      </div>
    </article>
  )
}
