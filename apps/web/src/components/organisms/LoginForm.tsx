import { useState, type FormEvent } from 'react'
import { emailPattern } from '../../utils/validation.ts'
import { Button } from '../atoms/Button.tsx'
import { Checkbox } from '../atoms/Checkbox.tsx'
import { Icon } from '../atoms/Icon.tsx'
import { TextLink } from '../atoms/TextLink.tsx'
import { FormField } from '../molecules/FormField.tsx'

export type LoginFormData = {
  email: string
  senha: string
  lembrar: boolean
}

type LoginFormErrors = Partial<Record<'email' | 'senha', string>>

type LoginFormProps = {
  onSubmit: (data: LoginFormData) => void
  error?: string
  loading?: boolean
}

function validate({ email, senha }: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {}
  if (!email.trim()) errors.email = 'Informe seu email.'
  else if (!emailPattern.test(email.trim())) errors.email = 'Informe um email válido.'
  if (!senha) errors.senha = 'Informe sua senha.'
  return errors
}

export function LoginForm({ onSubmit, error, loading = false }: LoginFormProps) {
  const [data, setData] = useState<LoginFormData>({
    email: '',
    senha: '',
    lembrar: false,
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = validate(data)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onSubmit(data)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="Digite seu email"
        autoComplete="email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        error={errors.email}
      />
      <div className="flex flex-col gap-2">
        <FormField
          label="Senha"
          name="senha"
          type="password"
          placeholder="******"
          autoComplete="current-password"
          value={data.senha}
          onChange={(e) => setData({ ...data, senha: e.target.value })}
          error={errors.senha}
        />
        <div className="flex items-center justify-between gap-4">
          <Checkbox
            label="Lembrar-me"
            name="lembrar"
            checked={data.lembrar}
            onChange={(e) => setData({ ...data, lembrar: e.target.checked })}
          />
          <TextLink to="/recuperar-senha">Esqueci a senha</TextLink>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-4" disabled={loading}>
        Login <Icon name="arrow-right" />
      </Button>
    </form>
  )
}
