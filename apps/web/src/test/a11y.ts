import axe from 'axe-core'

// WCAG 2.2 nível AA = regras de A + AA das versões 2.0, 2.1 e 2.2.
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

function formatViolations(violations: axe.Result[]) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    - ${node.target.join(' ')}\n      ${node.html}`)
        .join('\n')
      return `[${violation.impact}] ${violation.id}: ${violation.help}\n  ${violation.helpUrl}\n${nodes}`
    })
    .join('\n\n')
}

/**
 * Roda o axe-core contra o container e falha listando todas as violações WCAG A/AA.
 *
 * Limitação do jsdom: não há layout nem renderização, então `color-contrast`
 * (1.4.3 / 1.4.11) é desativada aqui e precisa de um teste em navegador real.
 */
export async function expectNoA11yViolations(container: Element) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: WCAG_AA_TAGS },
    rules: { 'color-contrast': { enabled: false } },
  })

  if (results.violations.length > 0) {
    throw new Error(
      `${results.violations.length} violação(ões) de acessibilidade (WCAG AA):\n\n${formatViolations(results.violations)}`,
    )
  }
}
