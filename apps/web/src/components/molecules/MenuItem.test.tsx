import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MenuItem } from './MenuItem.tsx'

describe('MenuItem', () => {
  it('é um link que indica a página atual', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <MenuItem icon="feed" label="Feed" to="/feed" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
  })

  it('é um botão quando recebe onClick', async () => {
    const onClick = vi.fn()
    render(<MenuItem icon="logout" label="Sair" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fica desabilitado sem destino nem ação', () => {
    render(<MenuItem icon="info" label="Sobre nós" />)
    expect(screen.getByText('Sobre nós')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
