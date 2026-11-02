import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useSession } from '../../hooks/useSession.ts'
import { getApiErrorMessage, getApiErrorStatus } from '../../services/apiError.ts'
import { createPost, type NewPost } from '../../services/posts.ts'
import { PostForm } from '../organisms/PostForm.tsx'

export function NewPostPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSession()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(post: NewPost) {
    setError(undefined)
    setLoading(true)
    try {
      const { id } = await createPost(post)
      await navigate(`/posts/${id}`)
    } catch (err) {
      // Sem token, o guarda abaixo já redireciona para o login.
      if (getApiErrorStatus(err) !== 401) {
        setError(
          getApiErrorMessage(err, {
            413: 'A imagem deve ter até 5 MB.',
            422: 'Verifique os dados informados e a imagem enviada.',
          }),
        )
      }
      setLoading(false)
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <PostForm
      onSubmit={(post) => void handleSubmit(post)}
      onDiscard={() => void navigate('/feed')}
      error={error}
      loading={loading}
    />
  )
}
