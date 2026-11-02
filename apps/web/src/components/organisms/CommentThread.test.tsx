import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildComment } from '../../test/fixtures.ts'
import { CommentThread } from './CommentThread.tsx'

const reply = buildComment({
  id: 'resposta-1',
  parentId: 'comentario-1',
  content: 'Uns 3 dias!',
  author: { id: 'autor-1', name: 'Julio Andrade' },
})
const comment = buildComment({ replies: [reply] })

describe('CommentThread', () => {
  it('mostra e oculta as respostas', async () => {
    render(<CommentThread comment={comment} canReply={false} onReply={vi.fn()} />)
    expect(screen.queryByText(/Uns 3 dias!/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ver respostas' }))
    expect(screen.getByText(/Uns 3 dias!/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar respostas' }))
    expect(screen.queryByText(/Uns 3 dias!/)).not.toBeInTheDocument()
  })

  it('não mostra o controle de respostas quando não há nenhuma', () => {
    render(<CommentThread comment={buildComment()} canReply={false} onReply={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Ver respostas' })).not.toBeInTheDocument()
  })

  it('não deixa um visitante responder', () => {
    render(<CommentThread comment={comment} canReply={false} onReply={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument()
  })

  it('responde ao comentário e exibe as respostas em seguida', async () => {
    const onReply = vi.fn().mockResolvedValue(undefined)
    render(<CommentThread comment={comment} canReply onReply={onReply} />)

    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))
    await userEvent.type(screen.getByLabelText('Responder a Marcia Ribeiro'), 'Concordo')
    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))

    expect(onReply).toHaveBeenCalledWith('Concordo', 'comentario-1')
    expect(await screen.findByText(/Uns 3 dias!/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Responder a Marcia Ribeiro')).not.toBeInTheDocument()
  })

  it('cancela a resposta', async () => {
    render(<CommentThread comment={comment} canReply onReply={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByLabelText('Responder a Marcia Ribeiro')).not.toBeInTheDocument()
  })
})
