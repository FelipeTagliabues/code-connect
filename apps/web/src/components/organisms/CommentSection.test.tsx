import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { buildComment } from '../../test/fixtures.ts'
import { CommentSection } from './CommentSection.tsx'

function renderSection(isAuthenticated: boolean, hasMore = false) {
  const onComment = vi.fn().mockResolvedValue(undefined)
  const onLoadMore = vi.fn()
  render(
    <MemoryRouter>
      <CommentSection
        comments={[buildComment()]}
        isAuthenticated={isAuthenticated}
        hasMore={hasMore}
        onComment={onComment}
        onLoadMore={onLoadMore}
      />
    </MemoryRouter>,
  )
  return { onComment, onLoadMore }
}

describe('CommentSection', () => {
  it('mostra os comentários para um visitante, sem formulário', () => {
    renderSection(false)
    expect(screen.getByRole('region', { name: 'Comentários' })).toBeInTheDocument()
    expect(screen.getByText(/Muito bom!/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça login' })).toHaveAttribute('href', '/login')
  })

  it('deixa quem está logado comentar', async () => {
    const { onComment } = renderSection(true)

    await userEvent.type(screen.getByLabelText('Escreva um comentário'), 'Ótimo!')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onComment).toHaveBeenCalledWith('Ótimo!')
  })

  it('carrega mais comentários', async () => {
    const { onLoadMore } = renderSection(false, true)
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais comentários' }))
    expect(onLoadMore).toHaveBeenCalledOnce()
  })
})
