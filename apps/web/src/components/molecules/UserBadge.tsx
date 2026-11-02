import { toHandle } from '../../utils/handle.ts'
import { Avatar } from '../atoms/Avatar.tsx'

type UserBadgeProps = {
  name: string
}

export function UserBadge({ name }: UserBadgeProps) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-input">
      <Avatar name={name} />
      <span className="truncate">{toHandle(name)}</span>
    </span>
  )
}
