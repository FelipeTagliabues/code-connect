import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tag } from './Tag.tsx'

describe('Tag', () => {
  it('é apenas texto quando não tem onClick', () => {
    render(<Tag>React</Tag>)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('vira um botão que informa se está selecionado', async () => {
    const onClick = vi.fn()
    render(
      <Tag selected onClick={onClick}>
        React
      </Tag>,
    )
    const tag = screen.getByRole('button', { name: 'React', pressed: true })
    expect(tag.querySelector('[data-icon="close"]')).toBeInTheDocument()

    await userEvent.click(tag)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
