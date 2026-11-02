type AvatarProps = {
  name: string
}

export function Avatar({ name }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-offwhite text-sm font-semibold text-card"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
