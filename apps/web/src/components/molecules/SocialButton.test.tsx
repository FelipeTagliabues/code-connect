import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SocialButton } from './SocialButton.tsx'

describe('SocialButton', () => {
  it('usa o nome do provedor como nome acessível e dispara onClick', async () => {
    const onClick = vi.fn()
    render(<SocialButton name="Github" icon="/github.png" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Github' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
