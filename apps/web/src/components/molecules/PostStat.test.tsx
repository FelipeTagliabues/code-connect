import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { PostStat } from './PostStat.tsx'

describe('PostStat', () => {
  it('é um botão com contagem e estado de pressionado', async () => {
    const onClick = vi.fn()
    render(<PostStat icon="code" label="Curtir" count={12} pressed onClick={onClick} />)

    const stat = screen.getByRole('button', { name: 'Curtir: 12', pressed: true })
    expect(stat).toHaveTextContent('12')

    await userEvent.click(stat)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('vira um link quando recebe to', () => {
    render(
      <MemoryRouter>
        <PostStat icon="chat" label="Comentários" count={3} to="/posts/1#comentarios" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Comentários: 3' })).toHaveAttribute(
      'href',
      '/posts/1#comentarios',
    )
  })

  it('não mostra número quando não há contagem', () => {
    render(<PostStat icon="share" label="Compartilhar" />)
    expect(screen.getByRole('button', { name: 'Compartilhar' })).toHaveTextContent('')
  })
})
