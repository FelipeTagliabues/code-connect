import { render, screen } from '@testing-library/react'
import { FormField } from './FormField.tsx'

describe('FormField', () => {
  it('associa o rótulo ao campo', () => {
    render(<FormField label="Senha" type="password" />)
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('exibe o erro e marca o campo como inválido', () => {
    render(<FormField label="Email" error="Campo obrigatório" />)
    const input = screen.getByLabelText('Email')
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Campo obrigatório')
  })
})
