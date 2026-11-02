import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { Post } from '../../services/posts.ts'
import { buildPost } from '../../test/fixtures.ts'
import { PostCard } from './PostCard.tsx'

function renderCard(post: Post, variant?: 'feed' | 'detail') {
  const onLike = vi.fn()
  const onShare = vi.fn()
  render(
    <MemoryRouter>
      <PostCard post={post} variant={variant} onLike={onLike} onShare={onShare} />
    </MemoryRouter>,
  )
  return { onLike, onShare }
}

describe('PostCard', () => {
  it('no feed, o título é um link de nível 2 para os detalhes', () => {
    renderCard(buildPost())
    const heading = screen.getByRole('heading', { level: 2, name: 'Título do post' })
    expect(within(heading).getByRole('link')).toHaveAttribute('href', '/posts/post-1')
  })

  it('nos detalhes, o título é o h1 e não é um link', () => {
    renderCard(buildPost(), 'detail')
    const heading = screen.getByRole('heading', { level: 1, name: 'Título do post' })
    expect(within(heading).queryByRole('link')).not.toBeInTheDocument()
  })

  it('mostra tags, contagens e o autor', () => {
    renderCard(buildPost())
    expect(within(screen.getByRole('list', { name: 'Tags' })).getByText('React')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Curtir: 12' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comentários: 3' })).toHaveAttribute(
      'href',
      '/posts/post-1#comentarios',
    )
    expect(screen.getByText('@julio.andrade')).toBeInTheDocument()
  })

  it('mostra o placeholder para um post sem thumbnail', () => {
    renderCard(buildPost({ thumbnailUrl: null }), 'detail')
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('avisa quando curtem ou compartilham', async () => {
    const post = buildPost({ likedByMe: true })
    const { onLike, onShare } = renderCard(post)

    await userEvent.click(screen.getByRole('button', { name: 'Curtir: 12', pressed: true }))
    await userEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))

    expect(onLike).toHaveBeenCalledWith(post)
    expect(onShare).toHaveBeenCalledWith(post)
  })
})
