import { render, screen } from '@testing-library/react'
import { Divider } from './Divider.tsx'

describe('Divider', () => {
  it('renderiza um separador com texto opcional', () => {
    render(<Divider text="ou entre com outras contas" />)
    expect(screen.getByRole('separator')).toHaveTextContent(
      'ou entre com outras contas',
    )
  })
})
