import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox.tsx'

describe('Checkbox', () => {
  it('alterna o estado ao clicar no rótulo', async () => {
    render(<Checkbox label="Lembrar-me" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Lembrar-me' })
    expect(checkbox).not.toBeChecked()
    await userEvent.click(screen.getByText('Lembrar-me'))
    expect(checkbox).toBeChecked()
  })
})
