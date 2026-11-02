import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  ScrollRestoration,
} from 'react-router'
import { FeedPage } from './components/pages/FeedPage.tsx'
import { LoginPage } from './components/pages/LoginPage.tsx'
import { NewPostPage } from './components/pages/NewPostPage.tsx'
import { PostDetailPage } from './components/pages/PostDetailPage.tsx'
import { SignupPage } from './components/pages/SignupPage.tsx'
import { MainTemplate } from './components/templates/MainTemplate.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/feed" replace /> },
  { path: '/inicio', element: <Navigate to="/feed" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <SignupPage /> },
  {
    element: (
      <>
        <ScrollRestoration />
        <MainTemplate />
      </>
    ),
    children: [
      { path: '/feed', element: <FeedPage /> },
      { path: '/posts/:id', element: <PostDetailPage /> },
      { path: '/publicar', element: <NewPostPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
