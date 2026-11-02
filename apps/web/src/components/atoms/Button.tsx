import type { ComponentProps } from 'react'

const variants = {
  primary: 'bg-primary text-on-primary',
  outline: 'border border-primary text-primary',
  neutral: 'border border-input text-input',
  // Sobre o painel de comentários, onde o verde não tem contraste.
  dark: 'bg-card text-offwhite',
  'outline-dark': 'border border-card text-card',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants
}

export function Button({
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-lg font-semibold transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
