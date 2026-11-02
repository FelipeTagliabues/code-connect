import { isAxiosError } from 'axios'

const DEFAULT_MESSAGE = 'Não foi possível concluir a solicitação. Tente novamente.'

export function getApiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

/** As mensagens da API estão em inglês, então o texto exibido vem do status. */
export function getApiErrorMessage(
  error: unknown,
  messagesByStatus: Record<number, string> = {},
): string {
  const status = getApiErrorStatus(error)
  return (status !== undefined && messagesByStatus[status]) || DEFAULT_MESSAGE
}
