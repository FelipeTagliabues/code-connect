import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LoginForm } from './LoginForm.tsx'

function renderForm() {
  const onSubmit = vi.fn()
  render(
    <MemoryRouter>
      <LoginForm onSubmit={onSubmit} />
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

  it('envia os dados preenchidos', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'usuario123')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onSubmit).toHaveBeenCalledWith({
      usuario: 'usuario123',
      senha: 'segredo',
      lembrar: true,
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
