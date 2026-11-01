import type { ReactNode } from 'react'
import { Heading } from '../atoms/Heading.tsx'

type AuthTemplateProps = {
  bannerSrc: string
  bannerAlt: string
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

function ChainShape({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 420 480"
      fill="none"
      stroke="currentColor"
      strokeWidth={45}
      className={`pointer-events-none absolute hidden text-shape lg:block ${className}`}
      aria-hidden="true"
    >
      <rect x="25" y="120" width="200" height="335" rx="100" />
      <rect x="195" y="25" width="200" height="335" rx="100" />
    </svg>
  )
}

/** Layout base das páginas de autenticação (login, cadastro). */
export function AuthTemplate({
  bannerSrc,
  bannerAlt,
  title,
  subtitle,
  children,
  footer,
}: AuthTemplateProps) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <ChainShape className="-top-10 left-[7%] w-[420px]" />
      <ChainShape className="right-[7%] -bottom-10 w-[420px]" />

      <main className="relative flex w-full max-w-[1000px] gap-16 rounded-4xl bg-card p-8 md:px-20 md:py-14">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="hidden w-[407px] shrink-0 object-cover md:block"
        />
        <section className="flex flex-1 flex-col gap-8">
          <header className="flex flex-col gap-6">
            <Heading>{title}</Heading>
            <p className="text-2xl text-offwhite">{subtitle}</p>
          </header>
          {children}
          {footer && (
            <footer className="flex flex-col items-center gap-3 text-offwhite">
              {footer}
            </footer>
          )}
        </section>
      </main>
    </div>
  )
}
