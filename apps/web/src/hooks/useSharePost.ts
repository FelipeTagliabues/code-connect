import { useState } from 'react'
import type { Post } from '../services/posts.ts'

export function useSharePost() {
  const [shareMessage, setShareMessage] = useState<string>()

  async function sharePost({ id, title }: Post) {
    const url = `${window.location.origin}/posts/${id}`
    setShareMessage(undefined)

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        // Fechar a janela é uma escolha; qualquer outra falha cai na cópia do link.
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('Link copiado!')
    } catch {
      setShareMessage('Não foi possível copiar o link.')
    }
  }

  return { sharePost, shareMessage }
}
