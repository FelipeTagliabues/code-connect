import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded bg-input px-4 py-2 text-card placeholder:text-card/70 focus-visible:outline-2 focus-visible:outline-primary aria-invalid:outline-2 aria-invalid:outline-error ${className}`}
      {...props}
    />
  )
}
