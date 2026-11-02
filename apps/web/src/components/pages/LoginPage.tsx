import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getApiErrorMessage } from '../../services/apiError.ts'
import { signIn } from '../../services/auth.ts'
import { AuthPrompt } from '../molecules/AuthPrompt.tsx'
import { LoginForm, type LoginFormData } from '../organisms/LoginForm.tsx'
import { SocialLogin } from '../organisms/SocialLogin.tsx'
import { AuthTemplate } from '../templates/AuthTemplate.tsx'

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function handleLogin({ email, senha, lembrar }: LoginFormData) {
    setError(undefined)
    setLoading(true)
    try {
      await signIn(email.trim(), senha, lembrar)
      await navigate('/feed')
    } catch (err) {
      setError(
        getApiErrorMessage(err, {
          401: 'Email ou senha inválidos.',
          422: 'Verifique os dados informados.',
        }),
      )
      setLoading(false)
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-login.png"
      bannerClassName="object-[51%_center]"
      bannerAlt="Pessoa sorrindo enquanto programa em um notebook, cercada por telas com brilho verde"
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
      footer={
        <AuthPrompt
          question="Ainda não tem conta?"
          linkLabel="Crie seu cadastro!"
          to="/cadastro"
          icon="clipboard"
        />
      }
    >
      <LoginForm onSubmit={handleLogin} error={error} loading={loading} />
      <SocialLogin />
    </AuthTemplate>
  )
}
