import type { ReactNode } from 'react'
import { Heading } from '../atoms/Heading.tsx'
import { Logo } from '../atoms/Logo.tsx'

type AuthTemplateProps = {
  bannerSrc: string
  /** Variantes responsivas do banner (ex.: `/b-768.webp 768w, /b.webp 1344w`). */
  bannerSrcSet?: string
  bannerAlt: string
  /** Enquadramento da foto dentro do banner (ex.: `object-[60%_center]`). */
  bannerClassName?: string
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

function ChainShape({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute hidden h-[486px] w-[407px] overflow-clip opacity-30 lg:block ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-[25.85%_44.09%_0_0]">
        <img src="/chain-a.svg" alt="" className="absolute block size-full max-w-none" />
      </div>
      <div className="absolute inset-[0_0.02%_25.85%_44.09%]">
        <img src="/chain-b.svg" alt="" className="absolute block size-full max-w-none" />
      </div>
    </div>
  )
}

/** Layout base das páginas de autenticação (login, cadastro). */
export function AuthTemplate({
  bannerSrc,
  bannerSrcSet,
  bannerAlt,
  bannerClassName = '',
  title,
  subtitle,
  children,
  footer,
}: AuthTemplateProps) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <ChainShape className="-top-2 left-[142px]" />
      <ChainShape className="right-[142px] bottom-0" />

      <main className="relative flex w-full max-w-[996px] flex-col gap-8 rounded-4xl border border-bg bg-card p-6 md:p-12 lg:flex-row lg:justify-between lg:px-[78px] lg:py-14">
        <figure className="relative h-80 shrink-0 overflow-hidden md:h-[414px] lg:h-auto lg:w-[407px]">
          <img
            src={bannerSrc}
            srcSet={bannerSrcSet}
            sizes="(min-width: 1024px) 900px, (min-width: 768px) 620px, 480px"
            width={1344}
            height={896}
            fetchPriority="high"
            decoding="async"
            alt={bannerAlt}
            className={`size-full object-cover ${bannerClassName}`}
          />
          <Logo className="absolute bottom-8 left-1/2 -translate-x-1/2" />
        </figure>
        <section className="flex flex-col gap-6 lg:w-[410px] lg:shrink-0 lg:px-8">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-6">
              <Heading>{title}</Heading>
              <p className="text-2xl text-offwhite">{subtitle}</p>
            </header>
            {children}
          </div>
          {footer}
        </section>
      </main>
    </div>
  )
}
