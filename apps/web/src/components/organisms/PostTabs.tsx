import type { PostSort } from '../../services/posts.ts'

const tabs: { value: PostSort; label: string }[] = [
  { value: 'recent', label: 'Recentes' },
  { value: 'popular', label: 'Populares' },
]

type PostTabsProps = {
  value: PostSort
  onChange: (value: PostSort) => void
}

export function PostTabs({ value, onChange }: PostTabsProps) {
  return (
    <div role="group" aria-label="Ordenar posts" className="flex justify-center gap-6">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.value)}
            className={`cursor-pointer px-1 text-2xl transition focus-visible:outline-2 focus-visible:outline-primary ${active ? 'font-semibold text-primary underline' : 'text-input hover:text-offwhite'}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
