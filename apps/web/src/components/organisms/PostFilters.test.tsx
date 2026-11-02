import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostFilters } from './PostFilters.tsx'

function renderFilters(props: { search?: string; selectedTags?: string[] } = {}) {
  const handlers = {
    onSearchChange: vi.fn(),
    onToggleTag: vi.fn(),
    onClear: vi.fn(),
  }
  render(
    <PostFilters
      search=""
      tags={['React', 'CSS']}
      selectedTags={[]}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('PostFilters', () => {
  it('avisa quando digitam na busca', async () => {
    const { onSearchChange } = renderFilters()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar posts' }), 'a')
    expect(onSearchChange).toHaveBeenCalledWith('a')
  })

  it('alterna um chip e mostra os selecionados primeiro', async () => {
    const { onToggleTag } = renderFilters({ selectedTags: ['CSS'] })
    const chips = screen.getAllByRole('button', { pressed: undefined }).filter((button) =>
      button.hasAttribute('aria-pressed'),
    )
    expect(chips.map((chip) => chip.textContent)).toEqual(['CSS', 'React'])

    await userEvent.click(screen.getByRole('button', { name: 'React', pressed: false }))
    expect(onToggleTag).toHaveBeenCalledWith('React')
  })

  it('mantém visível um chip selecionado fora da lista de populares', () => {
    renderFilters({ selectedTags: ['Docker'] })
    expect(screen.getByRole('button', { name: 'Docker', pressed: true })).toBeInTheDocument()
  })

  it('só oferece Limpar tudo quando há filtro ativo', async () => {
    renderFilters()
    expect(screen.queryByRole('button', { name: 'Limpar tudo' })).not.toBeInTheDocument()
  })

  it('limpa os filtros', async () => {
    const { onClear } = renderFilters({ search: 'react' })
    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
