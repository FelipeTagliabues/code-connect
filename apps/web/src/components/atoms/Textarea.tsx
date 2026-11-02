import type { ComponentProps } from 'react'

const surfaces = {
  default: 'bg-input placeholder:text-card',
  // Sobre o painel de comentários, que já tem o fundo de `bg-input`.
  light: 'bg-offwhite placeholder:text-input',
}

type TextareaProps = ComponentProps<'textarea'> & {
  surface?: keyof typeof surfaces
}

export function Textarea({ surface = 'default', className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full resize-y rounded px-4 py-2 text-sm text-card focus-visible:outline-2 focus-visible:outline-primary aria-invalid:outline-2 aria-invalid:outline-error ${surfaces[surface]} ${className}`}
      {...props}
    />
  )
}
