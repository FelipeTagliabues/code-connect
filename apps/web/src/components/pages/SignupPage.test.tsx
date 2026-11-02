import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { signIn, signUp, type User } from '../../services/auth.ts'
import { axiosError } from '../../test/axiosError.ts'
import { SignupPage } from './SignupPage.tsx'

vi.mock('../../services/auth.ts')

const user: User = {
  id: '1',
  name: 'Maria Silva',
  email: 'maria@exemplo.com',
  phone: '11987654321',
  createdAt: '2026-11-02T00:00:00.000Z',
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/feed" element={<p>Área logada</p>} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function submitSignup() {
  await userEvent.type(screen.getByLabelText('Nome'), 'Maria Silva')
  await userEvent.type(screen.getByLabelText('Email'), 'maria@exemplo.com')
  await userEvent.type(screen.getByLabelText('Telefone'), '(11) 98765-4321')
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.mocked(signUp).mockReset()
    vi.mocked(signIn).mockReset()
  })

  it('renderiza o cadastro com provedores sociais e link para login', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Faça seu login!' }),
    ).toHaveAttribute('href', '/login')
  })

  it('cadastra, faz login automático e navega para a área logada', async () => {
    vi.mocked(signUp).mockResolvedValue(user)
    vi.mocked(signIn).mockResolvedValue()
    renderPage()
    await submitSignup()
    expect(signUp).toHaveBeenCalledWith({
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      phone: '(11) 98765-4321',
      password: 'segredo123',
    })
    expect(signIn).toHaveBeenCalledWith('maria@exemplo.com', 'segredo123', false)
    expect(await screen.findByText('Área logada')).toBeInTheDocument()
  })

  it('mostra mensagem para email já cadastrado', async () => {
    vi.mocked(signUp).mockRejectedValue(axiosError(409))
    renderPage()
    await submitSignup()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este email já está cadastrado.',
    )
    expect(signIn).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled()
  })

  it('vai para o login quando o login automático falha', async () => {
    vi.mocked(signUp).mockResolvedValue(user)
    vi.mocked(signIn).mockRejectedValue(axiosError(500))
    renderPage()
    await submitSignup()
    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
  })
})
