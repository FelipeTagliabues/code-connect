import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostTabs } from './PostTabs.tsx'

describe('PostTabs', () => {
  it('marca a aba atual e avisa quando trocam', async () => {
    const onChange = vi.fn()
    render(<PostTabs value="recent" onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Recentes', pressed: true })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Populares', pressed: false }))

    expect(onChange).toHaveBeenCalledWith('popular')
  })
})
