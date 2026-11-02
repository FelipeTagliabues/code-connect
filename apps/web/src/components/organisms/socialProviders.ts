export type SocialProvider = {
  name: string
  icon: string
  onClick?: () => void
}

export const defaultSocialProviders: SocialProvider[] = [
  { name: 'Github', icon: '/github.png' },
  { name: 'Gmail', icon: '/gmail.png' },
]
