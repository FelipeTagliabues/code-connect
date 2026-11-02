import { AuthPrompt } from '../molecules/AuthPrompt.tsx'
import { LoginForm, type LoginFormData } from '../organisms/LoginForm.tsx'
import { SocialLogin } from '../organisms/SocialLogin.tsx'
import { AuthTemplate } from '../templates/AuthTemplate.tsx'

export function LoginPage() {
  function handleLogin({ usuario, lembrar }: LoginFormData) {
    // TODO: integrar com a API de autenticação
    console.log('login', { usuario, lembrar })
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
      <LoginForm onSubmit={handleLogin} />
      <SocialLogin />
    </AuthTemplate>
  )
}
