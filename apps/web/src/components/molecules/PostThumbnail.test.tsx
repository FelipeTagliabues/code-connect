import { fireEvent, render, screen } from '@testing-library/react'
import { PostThumbnail } from './PostThumbnail.tsx'

describe('PostThumbnail', () => {
  it('mostra a imagem quando ela existe', () => {
    render(<PostThumbnail src="/a.png" alt="Capa" />)
    expect(screen.getByRole('img', { name: 'Capa' })).toHaveAttribute('src', '/a.png')
  })

  it('mostra o placeholder quando o post não tem imagem', () => {
    render(<PostThumbnail src={null} alt="Capa" />)
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('troca pelo placeholder quando a imagem não carrega', () => {
    render(<PostThumbnail src="/quebrada.png" alt="Capa" />)
    fireEvent.error(screen.getByRole('img', { name: 'Capa' }))
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('tenta de novo quando recebe outra imagem', () => {
    const { rerender } = render(<PostThumbnail src="/quebrada.png" alt="Capa" />)
    fireEvent.error(screen.getByRole('img', { name: 'Capa' }))

    rerender(<PostThumbnail src="/nova.png" alt="Capa" />)

    expect(screen.getByRole('img', { name: 'Capa' })).toHaveAttribute('src', '/nova.png')
  })
})
