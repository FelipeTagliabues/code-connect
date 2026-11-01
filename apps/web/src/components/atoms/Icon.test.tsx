import { render } from '@testing-library/react'
import { Icon } from './Icon.tsx'

describe('Icon', () => {
  it('renderiza o ícone escondido de leitores de tela', () => {
    const { container } = render(<Icon name="arrow-right" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-icon', 'arrow-right')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
