import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { TextLink } from './TextLink.tsx'

describe('TextLink', () => {
  it('renderiza um link para a rota informada', () => {
    render(
      <MemoryRouter>
        <TextLink to="/cadastro">Cadastre-se</TextLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Cadastre-se' })).toHaveAttribute(
      'href',
      '/cadastro',
    )
  })
})
