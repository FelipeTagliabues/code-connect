import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './SignupForm.tsx'

function renderForm(props: { error?: string; loading?: boolean } = {}) {
  const onSubmit = vi.fn()
  render(<SignupForm onSubmit={onSubmit} {...props} />)
  return { onSubmit }
}

async function fillForm({
  email = 'maria@exemplo.com',
  telefone = '(11) 98765-4321',
  senha = 'segredo123',
} = {}) {
  await userEvent.type(screen.getByLabelText('Nome'), 'Maria Silva')
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Telefone'), telefone)
  await userEvent.type(screen.getByLabelText('Senha'), senha)
}

describe('SignupForm', () => {
  it('mostra erros e não envia quando os campos estão vazios', async () => {
    const { onSubmit } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getAllByRole('alert')).toHaveLength(4)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejeita email com formato inválido', async () => {
    const { onSubmit } = renderForm()
    await fillForm({ email: 'maria' })
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um email válido.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejeita telefone sem DDD', async () => {
    const { onSubmit } = renderForm()
    await fillForm({ telefone: '98765-4321' })
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um telefone com DDD.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejeita senha com menos de 8 caracteres', async () => {
    const { onSubmit } = renderForm()
    await fillForm({ senha: 'segredo' })
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A senha deve ter ao menos 8 caracteres.',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os dados preenchidos', async () => {
    const { onSubmit } = renderForm()
    await fillForm()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(onSubmit).toHaveBeenCalledWith({
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      telefone: '(11) 98765-4321',
      senha: 'segredo123',
      lembrar: true,
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra o erro recebido e desabilita o botão ao carregar', () => {
    renderForm({ error: 'Este email já está cadastrado.', loading: true })
    expect(screen.getByRole('alert')).toHaveTextContent('Este email já está cadastrado.')
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeDisabled()
  })
})
