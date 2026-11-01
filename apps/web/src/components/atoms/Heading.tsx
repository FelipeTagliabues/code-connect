import type { ReactNode } from 'react'

const sizes = {
  h1: 'text-3xl',
  h2: 'text-2xl',
}

type HeadingProps = {
  as?: keyof typeof sizes
  className?: string
  children: ReactNode
}

export function Heading({
  as: Tag = 'h1',
  className = '',
  children,
}: HeadingProps) {
  return (
    <Tag className={`font-semibold text-offwhite ${sizes[Tag]} ${className}`}>
      {children}
    </Tag>
  )
}
