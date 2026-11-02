import { render } from '@testing-library/react'
import { Avatar } from './Avatar.tsx'

describe('Avatar', () => {
  it('mostra a inicial do nome e fica oculto para leitores de tela', () => {
    const { container } = render(<Avatar name=" maria silva" />)
    const avatar = container.firstElementChild
    expect(avatar).toHaveTextContent('M')
    expect(avatar).toHaveAttribute('aria-hidden', 'true')
  })
})
