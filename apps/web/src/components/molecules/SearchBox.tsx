import type { ComponentProps } from 'react'
import { Icon } from '../atoms/Icon.tsx'

type SearchBoxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function SearchBox({ label, className = '', ...props }: SearchBoxProps) {
  return (
    <label
      className={`flex w-full items-center gap-4 rounded bg-card px-4 py-2 text-cinza-claro focus-within:outline-2 focus-within:outline-primary ${className}`}
    >
      <Icon name="search" className="size-8 shrink-0" />
      <input
        type="search"
        aria-label={label}
        className="w-full min-w-0 bg-transparent text-lg outline-none md:text-2xl placeholder:text-cinza-claro [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
    </label>
  )
}
