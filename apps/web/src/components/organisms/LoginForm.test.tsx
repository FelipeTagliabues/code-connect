import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LoginForm } from './LoginForm.tsx'

function renderForm(props: { error?: string; loading?: boolean } = {}) {
  const onSubmit = vi.fn()
  render(
    <MemoryRouter>
      <LoginForm onSubmit={onSubmit} {...props} />
    </MemoryRouter>,
  )
  return { onSubmit }
}

describe('LoginForm', () => {
  it('mostra erros e não envia quando os campos estão vazios', async () => {
    const { onSubmit } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejeita email com formato inválido', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Email'), 'maria')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um email válido.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os dados preenchidos', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Email'), 'maria@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'maria@exemplo.com',
      senha: 'segredo',
      lembrar: true,
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra o erro recebido e desabilita o botão ao carregar', () => {
    renderForm({ error: 'Email ou senha inválidos.', loading: true })
    expect(screen.getByRole('alert')).toHaveTextContent('Email ou senha inválidos.')
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled()
  })
})
