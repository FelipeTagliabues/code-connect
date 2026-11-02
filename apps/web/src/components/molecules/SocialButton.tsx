type SocialButtonProps = {
  name: string
  icon: string
  onClick?: () => void
}

export function SocialButton({ name, icon, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-1 rounded text-xs text-offwhite hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
    >
      <img src={icon} alt="" className="size-8" />
      {name}
    </button>
  )
}
