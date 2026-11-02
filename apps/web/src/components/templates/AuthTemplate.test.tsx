import { render, screen } from '@testing-library/react'
import { AuthTemplate } from './AuthTemplate.tsx'

describe('AuthTemplate', () => {
  it('renderiza banner, título, subtítulo, conteúdo e rodapé', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner.png"
        bannerAlt="Banner de teste"
        title="Título"
        subtitle="Subtítulo"
        footer={<p>Rodapé</p>}
      >
        <form aria-label="Formulário" />
      </AuthTemplate>,
    )
    expect(screen.getByRole('img', { name: 'Banner de teste' })).toHaveAttribute(
      'src',
      '/banner.png',
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Título' })).toBeInTheDocument()
    expect(screen.getByText('Subtítulo')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulário' })).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  it('carrega o banner com prioridade e variantes responsivas', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner.webp"
        bannerSrcSet="/banner-768.webp 768w, /banner.webp 1344w"
        bannerAlt="Banner de teste"
        title="Título"
        subtitle="Subtítulo"
      >
        <form aria-label="Formulário" />
      </AuthTemplate>,
    )
    const banner = screen.getByRole('img', { name: 'Banner de teste' })
    expect(banner).toHaveAttribute('srcset', '/banner-768.webp 768w, /banner.webp 1344w')
    expect(banner).toHaveAttribute('fetchpriority', 'high')
    expect(banner).not.toHaveAttribute('loading', 'lazy')
  })
})
