import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getApiErrorMessage } from '../../services/apiError.ts'
import { signIn, signUp } from '../../services/auth.ts'
import { AuthPrompt } from '../molecules/AuthPrompt.tsx'
import { SignupForm, type SignupFormData } from '../organisms/SignupForm.tsx'
import { SocialLogin } from '../organisms/SocialLogin.tsx'
import { AuthTemplate } from '../templates/AuthTemplate.tsx'

export function SignupPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function handleSignup({ nome, email, telefone, senha, lembrar }: SignupFormData) {
    const normalizedEmail = email.trim()
    setError(undefined)
    setLoading(true)
    try {
      await signUp({
        name: nome.trim(),
        email: normalizedEmail,
        phone: telefone,
        password: senha,
      })
    } catch (err) {
      setError(
        getApiErrorMessage(err, {
          409: 'Este email já está cadastrado.',
          422: 'Verifique os dados informados.',
        }),
      )
      setLoading(false)
      return
    }

    try {
      await signIn(normalizedEmail, senha, lembrar)
      await navigate('/feed')
    } catch {
      // A conta já existe: reenviar o cadastro retornaria 409.
      await navigate('/login')
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-cadastro.png"
      bannerClassName="object-[60%_center]"
      bannerAlt="Mulher de perfil trabalhando em um notebook, cercada por telas com brilho verde"
      title="Cadastro"
      subtitle="Olá! Preencha seus dados."
      footer={
        <AuthPrompt
          question="Já tem conta?"
          linkLabel="Faça seu login!"
          to="/login"
          icon="login"
          layout="inline"
        />
      }
    >
      <SignupForm onSubmit={handleSignup} error={error} loading={loading} />
      <SocialLogin />
    </AuthTemplate>
  )
}
