import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button.tsx'
import { Checkbox } from '../atoms/Checkbox.tsx'
import { Icon } from '../atoms/Icon.tsx'
import { FormField } from '../molecules/FormField.tsx'

export type SignupFormData = {
  nome: string
  email: string
  senha: string
  lembrar: boolean
}

type SignupFormErrors = Partial<Record<'nome' | 'email' | 'senha', string>>

type SignupFormProps = {
  onSubmit: (data: SignupFormData) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ nome, email, senha }: SignupFormData): SignupFormErrors {
  const errors: SignupFormErrors = {}
  if (!nome.trim()) errors.nome = 'Informe seu nome.'
  if (!email.trim()) errors.email = 'Informe seu email.'
  else if (!emailPattern.test(email.trim())) errors.email = 'Informe um email válido.'
  if (!senha) errors.senha = 'Informe uma senha.'
  return errors
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [data, setData] = useState<SignupFormData>({
    nome: '',
    email: '',
    senha: '',
    lembrar: false,
  })
  const [errors, setErrors] = useState<SignupFormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = validate(data)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onSubmit(data)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <FormField
          label="Nome"
          name="nome"
          placeholder="Nome completo"
          autoComplete="name"
          value={data.nome}
          onChange={(e) => setData({ ...data, nome: e.target.value })}
          error={errors.nome}
        />
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
            autoComplete="new-password"
            value={data.senha}
            onChange={(e) => setData({ ...data, senha: e.target.value })}
            error={errors.senha}
          />
          <Checkbox
            label="Lembrar-me"
            name="lembrar"
            checked={data.lembrar}
            onChange={(e) => setData({ ...data, lembrar: e.target.checked })}
          />
        </div>
      </div>
      <Button type="submit">
        Cadastrar <Icon name="arrow-right" />
      </Button>
    </form>
  )
}
