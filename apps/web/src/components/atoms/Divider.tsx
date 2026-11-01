type DividerProps = {
  text?: string
}

export function Divider({ text }: DividerProps) {
  return (
    <div className="flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-offwhite" />
      {text && <span className="text-sm text-offwhite">{text}</span>}
      <span className="h-px flex-1 bg-offwhite" />
    </div>
  )
}
