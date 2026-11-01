import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { LoginPage } from './components/pages/LoginPage.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
