import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

type TagProps = {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
}

export function Tag({ children, selected = false, onClick }: TagProps) {
  const classes = `inline-flex items-center gap-2.5 rounded px-2 py-1 text-lg whitespace-nowrap text-card ${selected ? 'bg-input' : 'bg-cinza-claro'}`

  if (!onClick) return <span className={classes}>{children}</span>

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${classes} cursor-pointer transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
    >
      {children}
      {selected && <Icon name="close" className="size-4" />}
    </button>
  )
}
