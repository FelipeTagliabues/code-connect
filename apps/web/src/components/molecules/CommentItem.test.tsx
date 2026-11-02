import { render, screen } from '@testing-library/react'
import { CommentItem } from './CommentItem.tsx'

describe('CommentItem', () => {
  it('mostra o autor e o conteúdo', () => {
    render(<CommentItem authorName="Marcia Ribeiro" content="Muito bom!" />)
    expect(screen.getByText('@marcia.ribeiro')).toBeInTheDocument()
    expect(screen.getByText(/Muito bom!/)).toBeInTheDocument()
  })
})
