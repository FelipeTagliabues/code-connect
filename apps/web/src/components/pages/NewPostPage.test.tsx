import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { createPost } from '../../services/posts.ts'
import { clearToken, setToken } from '../../services/tokenStorage.ts'
import { axiosError } from '../../test/axiosError.ts'
import { buildPost } from '../../test/fixtures.ts'
import { NewPostPage } from './NewPostPage.tsx'

vi.mock('../../services/posts.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/posts.ts')>()),
  createPost: vi.fn(),
}))

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/publicar']}>
      <Routes>
        <Route path="/publicar" element={<NewPostPage />} />
        <Route path="/login" element={<p>Tela de login</p>} />
        <Route path="/feed" element={<p>Tela do feed</p>} />
        <Route path="/posts/:id" element={<p>Detalhes do post</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndPublish() {
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'Nome')
  await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição')
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
}

describe('NewPostPage', () => {
  beforeEach(() => {
    clearToken()
    vi.mocked(createPost).mockReset()
  })

  it('leva um visitante para o login', () => {
    renderPage()
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('publica e abre os detalhes do post', async () => {
    setToken('abc', false)
    vi.mocked(createPost).mockResolvedValue(buildPost())
    renderPage()

    await fillAndPublish()

    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nome', description: 'Descrição' }),
    )
    expect(await screen.findByText('Detalhes do post')).toBeInTheDocument()
  })

  it('mostra o erro e libera um novo envio', async () => {
    setToken('abc', false)
    vi.mocked(createPost).mockRejectedValue(axiosError(413))
    renderPage()

    await fillAndPublish()

    expect(await screen.findByRole('alert')).toHaveTextContent('A imagem deve ter até 5 MB.')
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeEnabled()
  })

  it('volta para o feed ao descartar', async () => {
    setToken('abc', false)
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(screen.getByText('Tela do feed')).toBeInTheDocument()
  })
})
