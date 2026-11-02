import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { signIn } from '../../services/auth.ts'
import { axiosError } from '../../test/axiosError.ts'
import { LoginPage } from './LoginPage.tsx'

vi.mock('../../services/auth.ts')

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<p>Área logada</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function submitLogin() {
  await userEvent.type(screen.getByLabelText('Email'), 'maria@exemplo.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
  await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await userEvent.click(screen.getByRole('button', { name: 'Login' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset()
  })

  it('renderiza o login com provedores sociais e link para cadastro', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/cadastro')
  })

  it('faz login e navega para a área logada', async () => {
    vi.mocked(signIn).mockResolvedValue()
    renderPage()
    await submitLogin()
    expect(signIn).toHaveBeenCalledWith('maria@exemplo.com', 'segredo123', true)
    expect(await screen.findByText('Área logada')).toBeInTheDocument()
  })

  it('mostra mensagem para credenciais inválidas e libera novo envio', async () => {
    vi.mocked(signIn).mockRejectedValue(axiosError(401))
    renderPage()
    await submitLogin()
    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou senha inválidos.')
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled()
  })
})
