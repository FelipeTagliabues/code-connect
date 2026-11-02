import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { clearToken, setToken } from '../../services/tokenStorage.ts'
import { SideMenu } from './SideMenu.tsx'

function renderMenu() {
  render(
    <MemoryRouter initialEntries={['/feed']}>
      <SideMenu />
    </MemoryRouter>,
  )
}

describe('SideMenu', () => {
  beforeEach(() => {
    clearToken()
  })

  it('sem sessão, mostra Login e esconde Perfil', () => {
    renderMenu()
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
    expect(screen.queryByText('Perfil')).not.toBeInTheDocument()
  })

  it('com sessão, mostra Sair e Perfil', () => {
    setToken('abc', false)
    renderMenu()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(screen.getByText('Perfil')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
  })

  it('volta a mostrar Login ao sair', async () => {
    setToken('abc', false)
    renderMenu()

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })

  it('reage quando a sessão muda fora do menu', () => {
    renderMenu()
    act(() => setToken('abc', false))
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('sempre oferece Publicar e Feed', () => {
    renderMenu()
    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/publicar')
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
  })
})
