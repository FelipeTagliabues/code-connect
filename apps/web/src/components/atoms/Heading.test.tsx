import { render, screen } from '@testing-library/react'
import { Heading } from './Heading.tsx'

describe('Heading', () => {
  it('renderiza h1 por padrão', () => {
    render(<Heading>Login</Heading>)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Login' }),
    ).toBeInTheDocument()
  })

  it('permite escolher o nível via "as"', () => {
    render(<Heading as="h2">Seção</Heading>)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Seção' }),
    ).toBeInTheDocument()
  })
})
