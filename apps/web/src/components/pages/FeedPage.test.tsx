import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { likePost, listPosts, listTags, type Post } from '../../services/posts.ts'
import { clearToken, setToken } from '../../services/tokenStorage.ts'
import { axiosError } from '../../test/axiosError.ts'
import { buildPost } from '../../test/fixtures.ts'
import { FeedPage } from './FeedPage.tsx'

vi.mock('../../services/posts.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/posts.ts')>()),
  listPosts: vi.fn(),
  listTags: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

function Location() {
  const { search } = useLocation()
  return <p data-testid="search">{search}</p>
}

function renderPage(entry = '/feed') {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/feed"
          element={
            <>
              <FeedPage />
              <Location />
            </>
          }
        />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function mockPosts(posts: Post[], totalPages = 1) {
  vi.mocked(listPosts).mockResolvedValue({
    data: posts,
    meta: { page: 1, limit: 12, total: posts.length, totalPages },
  })
}

const lastListCall = () => vi.mocked(listPosts).mock.lastCall?.[0]

describe('FeedPage', () => {
  beforeEach(() => {
    clearToken()
    vi.mocked(listPosts).mockReset()
    vi.mocked(likePost).mockReset()
    vi.mocked(listTags).mockReset().mockResolvedValue([{ name: 'React', postsCount: 2 }])
  })

  it('mostra o carregamento e depois os posts', async () => {
    mockPosts([buildPost()])
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
    expect(await screen.findByRole('link', { name: 'Título do post' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('avisa quando não há resultados e quando a API falha', async () => {
    mockPosts([])
    renderPage()
    expect(await screen.findByText('Nenhum post encontrado.')).toBeInTheDocument()
  })

  it('mostra o erro quando a API falha', async () => {
    vi.mocked(listPosts).mockRejectedValue(axiosError(500))
    renderPage()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('busca no backend após a digitação e guarda o termo na URL', async () => {
    mockPosts([buildPost()])
    renderPage()
    await screen.findByRole('link', { name: 'Título do post' })

    await userEvent.type(screen.getByRole('searchbox'), 'hooks')

    await waitFor(() => expect(lastListCall()?.q).toBe('hooks'))
    expect(screen.getByTestId('search')).toHaveTextContent('?q=hooks')
    // A digitação inteira vira uma única busca, além da inicial.
    expect(listPosts).toHaveBeenCalledTimes(2)
  })

  it('restaura os filtros a partir da URL', async () => {
    mockPosts([buildPost()])
    renderPage('/feed?q=hooks&tag=Front-end&sort=popular')

    expect(screen.getByRole('searchbox')).toHaveValue('hooks')
    expect(
      await screen.findByRole('button', { name: 'Front-end', pressed: true }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Populares', pressed: true })).toBeInTheDocument()
    expect(lastListCall()).toMatchObject({ q: 'hooks "Front-end"', sort: 'popular', page: 1 })
  })

  it('transforma um chip em termo da busca e limpa tudo', async () => {
    mockPosts([buildPost()])
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'React', pressed: false }))
    await waitFor(() => expect(lastListCall()?.q).toBe('"React"'))
    expect(screen.getByTestId('search')).toHaveTextContent('?tag=React')

    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    await waitFor(() => expect(lastListCall()?.q).toBe(''))
    expect(screen.getByTestId('search')).toBeEmptyDOMElement()
  })

  it('troca a ordenação', async () => {
    mockPosts([buildPost()])
    renderPage()
    await screen.findByRole('link', { name: 'Título do post' })

    await userEvent.click(screen.getByRole('button', { name: 'Populares' }))

    await waitFor(() => expect(lastListCall()?.sort).toBe('popular'))
  })

  it('carrega a próxima página sem perder os posts atuais', async () => {
    mockPosts([buildPost()], 2)
    renderPage()
    await screen.findByRole('link', { name: 'Título do post' })

    vi.mocked(listPosts).mockResolvedValue({
      data: [buildPost({ id: 'post-2', title: 'Segundo post' })],
      meta: { page: 2, limit: 12, total: 2, totalPages: 2 },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))

    expect(await screen.findByRole('link', { name: 'Segundo post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Título do post' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
  })

  it('leva um visitante para o login ao curtir, sem chamar a API', async () => {
    mockPosts([buildPost()])
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir: 12' }))

    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
    expect(likePost).not.toHaveBeenCalled()
  })

  it('curte na hora e desfaz se a API recusar', async () => {
    setToken('abc', false)
    mockPosts([buildPost()])
    vi.mocked(likePost).mockRejectedValue(axiosError(500))
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir: 12' }))

    expect(likePost).toHaveBeenCalledWith('post-1')
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Curtir: 12', pressed: false })).toBeInTheDocument()
  })

  it('mantém a curtida quando a API aceita', async () => {
    setToken('abc', false)
    mockPosts([buildPost()])
    vi.mocked(likePost).mockResolvedValue()
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir: 12' }))

    expect(screen.getByRole('button', { name: 'Curtir: 13', pressed: true })).toBeInTheDocument()
  })

  it('leva ao login quando a sessão expirou ao curtir', async () => {
    setToken('abc', false)
    mockPosts([buildPost()])
    vi.mocked(likePost).mockRejectedValue(axiosError(401))
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir: 12' }))

    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
  })

  it('copia o link do post ao compartilhar', async () => {
    const user = userEvent.setup()
    mockPosts([buildPost()])
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Compartilhar' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Link copiado!')
    expect(await navigator.clipboard.readText()).toContain('/posts/post-1')
  })
})
