import type { ComponentProps } from 'react'

export function Label({ className = '', ...props }: ComponentProps<'label'>) {
  return <label className={`block text-lg ${className}`} {...props} />
}
