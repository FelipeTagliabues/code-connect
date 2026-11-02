import { Icon } from '../atoms/Icon.tsx'
import { TextLink } from '../atoms/TextLink.tsx'

const layouts = {
  stacked: {
    wrapper: 'flex-col items-center gap-2',
    question: 'text-sm',
  },
  inline: {
    wrapper: 'items-center gap-2',
    question: 'text-lg',
  },
}

type AuthPromptProps = {
  question: string
  linkLabel: string
  to: string
  icon: Parameters<typeof Icon>[0]['name']
  layout?: keyof typeof layouts
}

/** Chamada para alternar entre login e cadastro. */
export function AuthPrompt({
  question,
  linkLabel,
  to,
  icon,
  layout = 'stacked',
}: AuthPromptProps) {
  const styles = layouts[layout]
  return (
    <div className={`flex text-offwhite ${styles.wrapper}`}>
      <p className={styles.question}>{question}</p>
      <TextLink to={to} variant="accent">
        {linkLabel} <Icon name={icon} />
      </TextLink>
    </div>
  )
}
