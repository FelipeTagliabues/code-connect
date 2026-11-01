import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button.tsx'

describe('Button', () => {
  it('renderiza o conteúdo e usa type="button" por padrão', () => {
    render(<Button>Enviar</Button>)
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('dispara onClick ao ser clicado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Enviar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
