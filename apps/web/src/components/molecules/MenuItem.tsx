import { NavLink } from 'react-router'
import { Icon, type IconName } from '../atoms/Icon.tsx'

type MenuItemProps = {
  icon: IconName
  label: string
  to?: string
  onClick?: () => void
}

const base =
  'flex flex-col items-center gap-2 px-4 py-2 text-center text-lg md:text-2xl focus-visible:outline-2 focus-visible:outline-primary'
const interactive = 'cursor-pointer text-input transition hover:text-offwhite'

/** Sem `to` nem `onClick`, o item fica desabilitado: a página ainda não existe. */
export function MenuItem({ icon, label, to, onClick }: MenuItemProps) {
  const content = (
    <>
      <Icon name={icon} className="size-8" />
      {label}
    </>
  )

  if (to) {
    return (
      <NavLink
        to={to}
        end
        className={({ isActive }) => `${base} ${isActive ? 'text-branco' : interactive}`}
      >
        {content}
      </NavLink>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${interactive}`}>
        {content}
      </button>
    )
  }

  return (
    <span aria-disabled="true" className={`${base} cursor-not-allowed text-input`}>
      {content}
    </span>
  )
}
