import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { MainTemplate } from './MainTemplate.tsx'

describe('MainTemplate', () => {
  it('renderiza o menu e a página da rota filha dentro de main', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <Routes>
          <Route element={<MainTemplate />}>
            <Route path="/feed" element={<p>Conteúdo da página</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByText('Conteúdo da página')).toBeInTheDocument()
  })
})
