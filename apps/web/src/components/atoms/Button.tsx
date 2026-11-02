import type { ComponentProps } from 'react'

export function Button({
  type = 'button',
  className = '',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-lg font-semibold text-on-primary transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
