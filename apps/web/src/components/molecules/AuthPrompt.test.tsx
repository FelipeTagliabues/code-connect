import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthPrompt } from './AuthPrompt.tsx'

describe('AuthPrompt', () => {
  it('renderiza a pergunta e o link para a outra página', () => {
    render(
      <MemoryRouter>
        <AuthPrompt
          question="Já tem conta?"
          linkLabel="Faça seu login!"
          to="/login"
          icon="login"
          layout="inline"
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Já tem conta?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
