const paths = {
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" />
    </>
  ),
}

type IconProps = {
  name: keyof typeof paths
  className?: string
}

export function Icon({ name, className = 'size-5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      data-icon={name}
    >
      {paths[name]}
    </svg>
  )
}
