import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBox } from './SearchBox.tsx'

describe('SearchBox', () => {
  it('expõe o campo de busca pelo nome e avisa cada alteração', async () => {
    const onChange = vi.fn()
    render(<SearchBox label="Buscar posts" onChange={onChange} />)

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar posts' }), 'a')

    expect(onChange).toHaveBeenCalledOnce()
  })
})
