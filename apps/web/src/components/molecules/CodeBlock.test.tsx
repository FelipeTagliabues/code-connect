import { render, screen } from '@testing-library/react'
import { CodeBlock } from './CodeBlock.tsx'

describe('CodeBlock', () => {
  it('mostra o título e preserva o código', () => {
    const code = 'const a = 1\n  const b = 2'
    render(<CodeBlock code={code} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Código:' })).toBeInTheDocument()
    expect(screen.getByText(/const a = 1/).textContent).toBe(code)
  })
})
