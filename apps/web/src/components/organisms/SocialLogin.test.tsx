import { render, screen } from '@testing-library/react'
import { SocialLogin } from './SocialLogin.tsx'

describe('SocialLogin', () => {
  it('renderiza um botão por provedor', () => {
    render(
      <SocialLogin
        providers={[
          { name: 'Github', icon: '/github.png' },
          { name: 'Gmail', icon: '/gmail.png' },
        ]}
      />,
    )
    expect(screen.getByRole('separator')).toHaveTextContent(
      'ou entre com outras contas',
    )
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
  })
})
