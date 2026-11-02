import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { getPost, listComments, listPosts, listTags } from '../../services/posts.ts'
import { setToken } from '../../services/tokenStorage.ts'
import { expectNoA11yViolations } from '../../test/a11y.ts'
import { buildComment, buildPost } from '../../test/fixtures.ts'
import { MainTemplate } from '../templates/MainTemplate.tsx'
import { FeedPage } from './FeedPage.tsx'
import { LoginPage } from './LoginPage.tsx'
import { NewPostPage } from './NewPostPage.tsx'
import { PostDetailPage } from './PostDetailPage.tsx'
import { SignupPage } from './SignupPage.tsx'

vi.mock('../../services/auth.ts')
vi.mock('../../services/posts.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/posts.ts')>()),
  getPost: vi.fn(),
  listComments: vi.fn(),
  listPosts: vi.fn(),
  listTags: vi.fn(),
}))

const authPages = [
  { name: 'LoginPage', element: <LoginPage /> },
  { name: 'SignupPage', element: <SignupPage /> },
]

describe.each(authPages)('acessibilidade (WCAG AA) — $name', ({ element }) => {
  it('não tem violações detectáveis automaticamente', async () => {
    const { container } = render(<MemoryRouter>{element}</MemoryRouter>)
    await expectNoA11yViolations(container)
  })
})

const mainPages = [
  { name: 'FeedPage', path: '/feed', entry: '/feed', element: <FeedPage /> },
  { name: 'PostDetailPage', path: '/posts/:id', entry: '/posts/post-1', element: <PostDetailPage /> },
  { name: 'NewPostPage', path: '/publicar', entry: '/publicar', element: <NewPostPage /> },
]

describe.each(mainPages)('acessibilidade (WCAG AA) — $name', ({ path, entry, element }) => {
  beforeEach(() => {
    setToken('abc', false)
    const post = buildPost()
    vi.mocked(listPosts).mockResolvedValue({
      data: [post, buildPost({ id: 'post-2', title: 'Sem imagem', thumbnailUrl: null })],
      meta: { page: 1, limit: 12, total: 2, totalPages: 2 },
    })
    vi.mocked(listTags).mockResolvedValue([{ name: 'React', postsCount: 2 }])
    vi.mocked(getPost).mockResolvedValue(post)
    vi.mocked(listComments).mockResolvedValue({
      data: [buildComment()],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  })

  it('não tem violações detectáveis automaticamente', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route element={<MainTemplate />}>
            <Route path={path} element={element} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
