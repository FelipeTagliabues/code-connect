import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './SignupForm.tsx'

function renderForm() {
  const onSubmit = vi.fn()
  render(<SignupForm onSubmit={onSubmit} />)
  return { onSubmit }
}

describe('SignupForm', () => {
  it('mostra erros e não envia quando os campos estão vazios', async () => {
    const { onSubmit } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejeita email com formato inválido', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Nome'), 'Maria Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'maria')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um email válido.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os dados preenchidos', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Nome'), 'Maria Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'maria@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(onSubmit).toHaveBeenCalledWith({
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      senha: 'segredo',
      lembrar: true,
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
