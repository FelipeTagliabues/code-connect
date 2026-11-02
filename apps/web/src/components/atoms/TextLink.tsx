import type { ComponentProps } from 'react'
import { Link } from 'react-router'

const variants = {
  underline: 'text-offwhite underline underline-offset-2 hover:text-primary',
  accent: 'gap-3 text-lg text-primary hover:brightness-90 [&_svg]:size-6',
  button:
    'justify-center rounded-lg border border-primary px-4 py-3 text-2xl text-primary hover:brightness-90',
}

type TextLinkProps = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants
}

export function TextLink({
  variant = 'underline',
  className = '',
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={`inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-primary ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
