import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useSession } from '../../hooks/useSession.ts'
import { useSharePost } from '../../hooks/useSharePost.ts'
import { useToggleLike } from '../../hooks/useToggleLike.ts'
import { getApiErrorMessage, getApiErrorStatus } from '../../services/apiError.ts'
import {
  createComment,
  getPost,
  listComments,
  type Comment,
  type Post,
} from '../../services/posts.ts'
import { TextLink } from '../atoms/TextLink.tsx'
import { CodeBlock } from '../molecules/CodeBlock.tsx'
import { CommentSection } from '../organisms/CommentSection.tsx'
import { PostCard } from '../organisms/PostCard.tsx'

export function PostDetailPage() {
  const { id = '' } = useParams()
  // A `key` descarta o estado do post anterior ao navegar entre posts.
  return <PostDetail key={id} id={id} />
}

function PostDetail({ id }: { id: string }) {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useSession()

  const [post, setPost] = useState<Post>()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsPage, setCommentsPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string>()

  const { toggleLike, likeError } = useToggleLike(setPost)
  const { sharePost, shareMessage } = useSharePost()

  useEffect(() => {
    const controller = new AbortController()
    getPost(id, controller.signal)
      .then(setPost)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (getApiErrorStatus(err) === 404) setNotFound(true)
        else setError(getApiErrorMessage(err))
      })
    return () => controller.abort()
  }, [id, isAuthenticated])

  useEffect(() => {
    const controller = new AbortController()
    listComments(id, 1, controller.signal)
      .then(({ data, meta }) => {
        setComments(data)
        setCommentsPage(1)
        setHasMoreComments(meta.page < meta.totalPages)
      })
      .catch((err: unknown) => {
        // O 404 do post já é tratado acima.
        if (controller.signal.aborted || getApiErrorStatus(err) === 404) return
        setError(getApiErrorMessage(err))
      })
    return () => controller.abort()
  }, [id])

  const isLoaded = post !== undefined

  // O link de comentários do feed só consegue rolar depois que a seção existe.
  useEffect(() => {
    if (isLoaded && hash === '#comentarios') {
      document.getElementById('comentarios')?.scrollIntoView?.()
    }
  }, [isLoaded, hash])

  async function handleLoadMoreComments() {
    try {
      const nextPage = commentsPage + 1
      const { data, meta } = await listComments(id, nextPage)
      setComments((current) => {
        const known = new Set(current.map((comment) => comment.id))
        return [...current, ...data.filter((comment) => !known.has(comment.id))]
      })
      setCommentsPage(nextPage)
      setHasMoreComments(meta.page < meta.totalPages)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  async function handleComment(content: string, parentId?: string) {
    try {
      const created = await createComment(id, content, parentId)
      // A API achata respostas de respostas: o pai retornado é sempre a raiz.
      setComments((current) =>
        created.parentId
          ? current.map((comment) =>
              comment.id === created.parentId
                ? { ...comment, replies: [...comment.replies, created] }
                : comment,
            )
          : hasMoreComments
            ? current
            : [...current, created],
      )
      setPost(
        (current) =>
          current && { ...current, commentsCount: current.commentsCount + 1 },
      )
    } catch (err) {
      if (getApiErrorStatus(err) === 401) {
        await navigate('/login')
        return
      }
      throw err
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold">Post não encontrado</h1>
        <TextLink to="/feed">Voltar para o feed</TextLink>
      </div>
    )
  }

  if (!post) {
    return error ? (
      <p role="alert" className="text-sm text-error">
        {error}
      </p>
    ) : (
      <p role="status">Carregando...</p>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <PostCard
          post={post}
          variant="detail"
          onLike={(target) => void toggleLike(target)}
          onShare={(target) => void sharePost(target)}
        />
        {shareMessage && (
          <p role="status" className="text-center text-sm text-primary">
            {shareMessage}
          </p>
        )}
        {(likeError ?? error) && (
          <p role="alert" className="text-sm text-error">
            {likeError ?? error}
          </p>
        )}
        {post.code && <CodeBlock code={post.code} />}
      </div>
      <CommentSection
        comments={comments}
        isAuthenticated={isAuthenticated}
        hasMore={hasMoreComments}
        onComment={handleComment}
        onLoadMore={() => void handleLoadMoreComments()}
      />
    </div>
  )
}
