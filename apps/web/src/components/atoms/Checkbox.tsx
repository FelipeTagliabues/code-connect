import type { ComponentProps } from 'react'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-sm text-input ${className}`}
    >
      <input
        type="checkbox"
        className="size-5 cursor-pointer accent-primary"
        {...props}
      />
      {label}
    </label>
  )
}
