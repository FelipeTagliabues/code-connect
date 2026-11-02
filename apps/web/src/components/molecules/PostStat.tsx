import { Link } from 'react-router'
import { Icon, type IconName } from '../atoms/Icon.tsx'

type PostStatProps = {
  icon: IconName
  label: string
  count?: number
  pressed?: boolean
  onClick?: () => void
  to?: string
}

export function PostStat({ icon, label, count, pressed, onClick, to }: PostStatProps) {
  const classes = `flex cursor-pointer flex-col items-center text-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-primary ${pressed ? 'text-primary' : 'text-input'}`
  const name = count === undefined ? label : `${label}: ${count}`
  const content = (
    <>
      <Icon name={icon} className="size-6" />
      {count !== undefined && <span>{count}</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} aria-label={name} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={name}
      aria-pressed={pressed}
      onClick={onClick}
      className={classes}
    >
      {content}
    </button>
  )
}
