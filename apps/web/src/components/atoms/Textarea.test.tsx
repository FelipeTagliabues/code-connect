import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './Textarea.tsx'

describe('Textarea', () => {
  it('repassa as props e recebe digitação', async () => {
    render(<Textarea aria-label="Descrição" placeholder="Escreva" />)
    const textarea = screen.getByRole('textbox', { name: 'Descrição' })
    expect(textarea).toHaveAttribute('placeholder', 'Escreva')

    await userEvent.type(textarea, 'Olá')
    expect(textarea).toHaveValue('Olá')
  })
})
