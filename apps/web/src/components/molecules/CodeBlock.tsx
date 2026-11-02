type CodeBlockProps = {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold text-input">Código:</h2>
      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-lg bg-card p-4 font-mono text-sm text-cinza-claro shadow-editor focus-visible:outline-2 focus-visible:outline-primary"
      >
        <code>{code}</code>
      </pre>
    </section>
  )
}
