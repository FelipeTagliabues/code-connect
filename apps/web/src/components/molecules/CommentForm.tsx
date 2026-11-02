import { useId, useState, type FormEvent } from 'react'
import { getApiErrorMessage } from '../../services/apiError.ts'
import { Button } from '../atoms/Button.tsx'
import { Label } from '../atoms/Label.tsx'
import { Textarea } from '../atoms/Textarea.tsx'

type CommentFormProps = {
  label: string
  submitLabel: string
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
}

export function CommentForm({ label, submitLabel, onSubmit, onCancel }: CommentFormProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [content, setContent] = useState('')
  const [error, setError] = useState<string>()
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) {
      setError('Escreva um comentário.')
      return
    }

    setError(undefined)
    setSending(true)
    try {
      await onSubmit(trimmed)
      setContent('')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-2 text-card"
    >
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Textarea
        id={id}
        rows={3}
        maxLength={2000}
        surface="light"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm font-semibold">
          {error}
        </p>
      )}
      <div className="ml-auto flex w-full gap-2 sm:w-80">
        {onCancel && (
          <Button variant="outline-dark" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="dark" disabled={sending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
