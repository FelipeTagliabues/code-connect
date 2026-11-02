import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { LoginPage } from './components/pages/LoginPage.tsx'
import { SignupPage } from './components/pages/SignupPage.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <SignupPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
