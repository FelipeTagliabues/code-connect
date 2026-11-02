import { Link } from 'react-router'
import type { Comment } from '../../services/posts.ts'
import { Button } from '../atoms/Button.tsx'
import { CommentForm } from '../molecules/CommentForm.tsx'
import { CommentThread } from './CommentThread.tsx'

type CommentSectionProps = {
  comments: Comment[]
  isAuthenticated: boolean
  hasMore: boolean
  onComment: (content: string, parentId?: string) => Promise<void>
  onLoadMore: () => void
}

export function CommentSection({
  comments,
  isAuthenticated,
  hasMore,
  onComment,
  onLoadMore,
}: CommentSectionProps) {
  return (
    <section
      id="comentarios"
      aria-labelledby="comentarios-titulo"
      className="flex flex-col gap-6 bg-input px-4 py-8 text-card md:px-8"
    >
      <h2 id="comentarios-titulo" className="text-2xl font-semibold">
        Comentários
      </h2>

      {isAuthenticated ? (
        <CommentForm
          label="Escreva um comentário"
          submitLabel="Comentar"
          onSubmit={(content) => onComment(content)}
        />
      ) : (
        <p className="text-sm">
          <Link
            to="/login"
            className="font-semibold underline focus-visible:outline-2 focus-visible:outline-card"
          >
            Faça login
          </Link>{' '}
          para comentar.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm">Ainda não há comentários.</p>
      ) : (
        <ul className="flex flex-col gap-4 divide-y divide-card">
          {comments.map((comment) => (
            <li key={comment.id} className="pb-4 last:pb-0">
              <CommentThread
                comment={comment}
                canReply={isAuthenticated}
                onReply={onComment}
              />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <Button variant="outline-dark" onClick={onLoadMore}>
          Carregar mais comentários
        </Button>
      )}
    </section>
  )
}
