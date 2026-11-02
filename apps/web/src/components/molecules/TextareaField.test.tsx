import { render, screen } from '@testing-library/react'
import { TextareaField } from './TextareaField.tsx'

describe('TextareaField', () => {
  it('associa o rótulo ao campo', () => {
    render(<TextareaField label="Descrição" />)
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA')
  })

  it('associa o erro ao campo', () => {
    render(<TextareaField label="Descrição" error="Obrigatório" />)
    const textarea = screen.getByLabelText('Descrição')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAccessibleDescription('Obrigatório')
  })
})
