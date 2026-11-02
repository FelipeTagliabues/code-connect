import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expectNoA11yViolations } from '../../test/a11y.ts'
import { LoginPage } from './LoginPage.tsx'
import { SignupPage } from './SignupPage.tsx'

const pages = [
  { name: 'LoginPage', element: <LoginPage /> },
  { name: 'SignupPage', element: <SignupPage /> },
]

describe.each(pages)('acessibilidade (WCAG AA) — $name', ({ element }) => {
  it('não tem violações detectáveis automaticamente', async () => {
    const { container } = render(<MemoryRouter>{element}</MemoryRouter>)
    await expectNoA11yViolations(container)
  })
})
