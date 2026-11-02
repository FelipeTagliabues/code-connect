import { useId, type ComponentProps } from 'react'
import { Label } from '../atoms/Label.tsx'
import { Textarea } from '../atoms/Textarea.tsx'

type TextareaFieldProps = ComponentProps<'textarea'> & {
  label: string
  error?: string
}

export function TextareaField({ label, error, id, ...textareaProps }: TextareaFieldProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={textareaId}>{label}</Label>
      <Textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...textareaProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
