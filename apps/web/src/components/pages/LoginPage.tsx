import { Icon } from '../atoms/Icon.tsx'
import { TextLink } from '../atoms/TextLink.tsx'
import { LoginForm, type LoginFormData } from '../organisms/LoginForm.tsx'
import { SocialLogin, type SocialProvider } from '../organisms/SocialLogin.tsx'
import { AuthTemplate } from '../templates/AuthTemplate.tsx'

const socialProviders: SocialProvider[] = [
  { name: 'Github', icon: '/github.png' },
  { name: 'Gmail', icon: '/gmail.png' },
]

export function LoginPage() {
  function handleLogin({ usuario, lembrar }: LoginFormData) {
    // TODO: integrar com a API de autenticação
    console.log('login', { usuario, lembrar })
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-login.png"
      bannerAlt="Pessoa sorrindo enquanto programa em um notebook, cercada por telas com brilho verde"
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
      footer={
        <>
          <p>Ainda não tem conta?</p>
          <TextLink to="/cadastro" variant="accent">
            Crie seu cadastro! <Icon name="clipboard" />
          </TextLink>
        </>
      }
    >
      <LoginForm onSubmit={handleLogin} />
      <SocialLogin providers={socialProviders} />
    </AuthTemplate>
  )
}
