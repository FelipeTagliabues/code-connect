import { render, screen } from '@testing-library/react'
import { UserBadge } from './UserBadge.tsx'

describe('UserBadge', () => {
  it('mostra o @ derivado do nome', () => {
    render(<UserBadge name="Marcela Lins" />)
    expect(screen.getByText('@marcela.lins')).toBeInTheDocument()
  })
})
