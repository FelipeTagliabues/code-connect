import { Tag } from '../atoms/Tag.tsx'
import { SearchBox } from '../molecules/SearchBox.tsx'

type PostFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  tags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClear: () => void
}

export function PostFilters({
  search,
  onSearchChange,
  tags,
  selectedTags,
  onToggleTag,
  onClear,
}: PostFiltersProps) {
  const unselected = tags.filter((tag) => !selectedTags.includes(tag))
  const hasFilters = search !== '' || selectedTags.length > 0

  return (
    <div role="search" className="flex flex-col gap-4">
      <SearchBox
        label="Buscar posts"
        placeholder="Digite o que você procura"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {selectedTags.map((tag) => (
            <Tag key={tag} selected onClick={() => onToggleTag(tag)}>
              {tag}
            </Tag>
          ))}
          {unselected.map((tag) => (
            <Tag key={tag} onClick={() => onToggleTag(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer text-lg whitespace-nowrap text-input transition hover:text-offwhite focus-visible:outline-2 focus-visible:outline-primary"
          >
            Limpar tudo
          </button>
        )}
      </div>
    </div>
  )
}
