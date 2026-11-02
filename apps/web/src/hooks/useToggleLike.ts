import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getApiErrorMessage, getApiErrorStatus } from '../services/apiError.ts'
import { likePost, unlikePost, type Post } from '../services/posts.ts'
import { useSession } from './useSession.ts'

/** Atualiza a tela antes da resposta e desfaz se a API recusar. */
export function useToggleLike(updatePost: (post: Post) => void) {
  const navigate = useNavigate()
  const { isAuthenticated } = useSession()
  const [likeError, setLikeError] = useState<string>()

  async function toggleLike(post: Post) {
    if (!isAuthenticated) {
      await navigate('/login')
      return
    }

    const liked = !post.likedByMe
    setLikeError(undefined)
    updatePost({
      ...post,
      likedByMe: liked,
      likesCount: post.likesCount + (liked ? 1 : -1),
    })

    try {
      await (liked ? likePost(post.id) : unlikePost(post.id))
    } catch (err) {
      updatePost(post)
      if (getApiErrorStatus(err) === 401) {
        await navigate('/login')
        return
      }
      setLikeError(getApiErrorMessage(err))
    }
  }

  return { toggleLike, likeError }
}
