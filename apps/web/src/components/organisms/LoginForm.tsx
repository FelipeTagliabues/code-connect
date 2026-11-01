import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button.tsx'
import { Checkbox } from '../atoms/Checkbox.tsx'
import { Icon } from '../atoms/Icon.tsx'
import { TextLink } from '../atoms/TextLink.tsx'
import { FormField } from '../molecules/FormField.tsx'

export type LoginFormData = {
  usuario: string
  senha: string
  lembrar: boolean
}

type LoginFormErrors = Partial<Record<'usuario' | 'senha', string>>

type LoginFormProps = {
  onSubmit: (data: LoginFormData) => void
}

function validate({ usuario, senha }: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {}
  if (!usuario.trim()) errors.usuario = 'Informe seu email ou usuário.'
  if (!senha) errors.senha = 'Informe sua senha.'
  return errors
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [data, setData] = useState<LoginFormData>({
    usuario: '',
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
        label="Email ou usuário"
        name="usuario"
        placeholder="usuario123"
        autoComplete="username"
        value={data.usuario}
        onChange={(e) => setData({ ...data, usuario: e.target.value })}
        error={errors.usuario}
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
      <Button type="submit" className="mt-4">
        Login <Icon name="arrow-right" />
      </Button>
    </form>
  )
}
