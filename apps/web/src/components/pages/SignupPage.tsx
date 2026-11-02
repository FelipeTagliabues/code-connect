import { AuthPrompt } from '../molecules/AuthPrompt.tsx'
import { SignupForm, type SignupFormData } from '../organisms/SignupForm.tsx'
import { SocialLogin } from '../organisms/SocialLogin.tsx'
import { AuthTemplate } from '../templates/AuthTemplate.tsx'

export function SignupPage() {
  function handleSignup({ nome, email, lembrar }: SignupFormData) {
    // TODO: integrar com a API de cadastro
    console.log('cadastro', { nome, email, lembrar })
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
      <SignupForm onSubmit={handleSignup} />
      <SocialLogin />
    </AuthTemplate>
  )
}
