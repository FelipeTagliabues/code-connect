import { Divider } from '../atoms/Divider.tsx'
import { SocialButton } from '../molecules/SocialButton.tsx'

export type SocialProvider = {
  name: string
  icon: string
  onClick?: () => void
}

type SocialLoginProps = {
  providers: SocialProvider[]
  text?: string
}

export function SocialLogin({
  providers,
  text = 'ou entre com outras contas',
}: SocialLoginProps) {
  return (
    <div className="flex flex-col gap-4">
      <Divider text={text} />
      <ul className="flex justify-center gap-6">
        {providers.map((provider) => (
          <li key={provider.name}>
            <SocialButton {...provider} />
          </li>
        ))}
      </ul>
    </div>
  )
}
