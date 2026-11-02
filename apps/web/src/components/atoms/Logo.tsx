const parts = [
  { src: '/logo/logo-1.svg', inset: 'inset-[35.48%_88.04%_6.09%_0]' },
  { src: '/logo/logo-2.svg', inset: 'inset-[15.11%_78.6%_26.47%_9.43%]' },
  { src: '/logo/logo-3.svg', inset: 'inset-[0_0_0_26.88%]' },
]

type LogoProps = {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div
      role="img"
      aria-label="Code Connect"
      className={`relative h-10 w-[127.258px] shrink-0 overflow-clip ${className}`}
    >
      {parts.map(({ src, inset }) => (
        <div key={src} className={`absolute ${inset}`}>
          <img src={src} alt="" className="absolute block size-full max-w-none" />
        </div>
      ))}
    </div>
  )
}
