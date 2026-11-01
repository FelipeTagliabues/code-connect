import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input.tsx'

describe('Input', () => {
  it('repassa props nativas e aceita digitação', async () => {
    render(<Input aria-label="Nome" placeholder="Seu nome" />)
    const input = screen.getByRole('textbox', { name: 'Nome' })
    expect(input).toHaveAttribute('placeholder', 'Seu nome')
    await userEvent.type(input, 'Ana')
    expect(input).toHaveValue('Ana')
  })
})
