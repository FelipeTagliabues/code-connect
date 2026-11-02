/** Usuários não têm username: o @ é derivado do nome, apenas para exibição. */
export function toHandle(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return `@${slug}`
}
