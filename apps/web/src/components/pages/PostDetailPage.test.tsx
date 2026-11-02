import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import {
  createComment,
  getPost,
  likePost,
  listComments,
} from '../../services/posts.ts'
import { clearToken, setToken } from '../../services/tokenStorage.ts'
import { axiosError } from '../../test/axiosError.ts'
import { buildComment, buildPost } from '../../test/fixtures.ts'
import { PostDetailPage } from './PostDetailPage.tsx'

vi.mock('../../services/posts.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/posts.ts')>()),
  getPost: vi.fn(),
  listComments: vi.fn(),
  createComment: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/posts/post-1']}>
      <Routes>
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function mockComments(comments = [buildComment()], totalPages = 1) {
  vi.mocked(listComments).mockResolvedValue({
    data: comments,
    meta: { page: 1, limit: 20, total: comments.length, totalPages },
  })
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    clearToken()
    vi.mocked(getPost).mockReset().mockResolvedValue(buildPost())
    vi.mocked(createComment).mockReset()
    vi.mocked(likePost).mockReset()
    vi.mocked(listComments).mockReset()
    mockComments()
  })

  it('mostra o post, o código e os comentários para um visitante', async () => {
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Título do post' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Código:' })).toBeInTheDocument()
    expect(await screen.findByText(/Muito bom!/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('não mostra o bloco de código quando o post não tem', async () => {
    vi.mocked(getPost).mockResolvedValue(buildPost({ code: null }))
    renderPage()
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByRole('heading', { name: 'Código:' })).not.toBeInTheDocument()
  })

  it('avisa quando o post não existe', async () => {
    vi.mocked(getPost).mockRejectedValue(axiosError(404))
    vi.mocked(listComments).mockRejectedValue(axiosError(404))
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Post não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o feed' })).toHaveAttribute(
      'href',
      '/feed',
    )
  })

  it('mostra o erro quando a API falha', async () => {
    vi.mocked(getPost).mockRejectedValue(axiosError(500))
    renderPage()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('publica um comentário e atualiza a contagem', async () => {
    setToken('abc', false)
    vi.mocked(createComment).mockResolvedValue(
      buildComment({ id: 'novo', content: 'Comentário novo' }),
    )
    renderPage()

    await userEvent.type(await screen.findByLabelText('Escreva um comentário'), 'Comentário novo')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(createComment).toHaveBeenCalledWith('post-1', 'Comentário novo', undefined)
    expect(await screen.findByText(/Comentário novo/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comentários: 4' })).toBeInTheDocument()
  })

  it('publica uma resposta dentro do comentário', async () => {
    setToken('abc', false)
    vi.mocked(createComment).mockResolvedValue(
      buildComment({ id: 'resposta', parentId: 'comentario-1', content: 'Resposta nova' }),
    )
    renderPage()

    const section = await screen.findByRole('region', { name: 'Comentários' })
    await userEvent.click(await within(section).findByRole('button', { name: 'Responder' }))
    await userEvent.type(screen.getByLabelText('Responder a Marcia Ribeiro'), 'Resposta nova')
    await userEvent.click(within(section).getByRole('button', { name: 'Responder' }))

    expect(createComment).toHaveBeenCalledWith('post-1', 'Resposta nova', 'comentario-1')
    expect(await screen.findByText(/Resposta nova/)).toBeInTheDocument()
  })

  it('leva ao login quando a sessão expirou ao comentar', async () => {
    setToken('abc', false)
    vi.mocked(createComment).mockRejectedValue(axiosError(401))
    renderPage()

    await userEvent.type(await screen.findByLabelText('Escreva um comentário'), 'Oi')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
  })

  it('carrega mais comentários', async () => {
    mockComments([buildComment()], 2)
    renderPage()
    const button = await screen.findByRole('button', { name: 'Carregar mais comentários' })

    vi.mocked(listComments).mockResolvedValue({
      data: [buildComment({ id: 'c2', content: 'Da segunda página' })],
      meta: { page: 2, limit: 20, total: 2, totalPages: 2 },
    })
    await userEvent.click(button)

    expect(await screen.findByText(/Da segunda página/)).toBeInTheDocument()
    expect(listComments).toHaveBeenLastCalledWith('post-1', 2)
    expect(screen.queryByRole('button', { name: 'Carregar mais comentários' })).not.toBeInTheDocument()
  })

  it('curte o post', async () => {
    setToken('abc', false)
    vi.mocked(likePost).mockResolvedValue()
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir: 12' }))

    expect(screen.getByRole('button', { name: 'Curtir: 13', pressed: true })).toBeInTheDocument()
  })
})
