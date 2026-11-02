import { useState, type FormEvent } from 'react'
import { emailPattern } from '../../utils/validation.ts'
import { Button } from '../atoms/Button.tsx'
import { Checkbox } from '../atoms/Checkbox.tsx'
import { Icon } from '../atoms/Icon.tsx'
import { FormField } from '../molecules/FormField.tsx'

export type SignupFormData = {
  nome: string
  email: string
  telefone: string
  senha: string
  lembrar: boolean
}

type SignupFormErrors = Partial<
  Record<'nome' | 'email' | 'telefone' | 'senha', string>
>

type SignupFormProps = {
  onSubmit: (data: SignupFormData) => void
  error?: string
  loading?: boolean
}

const phonePattern = /^\d{10,11}$/
const MIN_PASSWORD_LENGTH = 8

function validate({ nome, email, telefone, senha }: SignupFormData): SignupFormErrors {
  const errors: SignupFormErrors = {}
  if (!nome.trim()) errors.nome = 'Informe seu nome.'
  if (!email.trim()) errors.email = 'Informe seu email.'
  else if (!emailPattern.test(email.trim())) errors.email = 'Informe um email válido.'
  if (!telefone.trim()) errors.telefone = 'Informe seu telefone.'
  else if (!phonePattern.test(telefone.replace(/\D/g, '')))
    errors.telefone = 'Informe um telefone com DDD.'
  if (!senha) errors.senha = 'Informe uma senha.'
  else if (senha.length < MIN_PASSWORD_LENGTH)
    errors.senha = `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`
  return errors
}

export function SignupForm({ onSubmit, error, loading = false }: SignupFormProps) {
  const [data, setData] = useState<SignupFormData>({
    nome: '',
    email: '',
    telefone: '',
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
        <FormField
          label="Telefone"
          name="telefone"
          type="tel"
          placeholder="(11) 98765-4321"
          autoComplete="tel"
          value={data.telefone}
          onChange={(e) => setData({ ...data, telefone: e.target.value })}
          error={errors.telefone}
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
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        Cadastrar <Icon name="arrow-right" />
      </Button>
    </form>
  )
}
