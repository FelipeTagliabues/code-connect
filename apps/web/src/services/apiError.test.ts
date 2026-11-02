import { axiosError } from '../test/axiosError.ts'
import { getApiErrorMessage, getApiErrorStatus } from './apiError.ts'

describe('apiError', () => {
  it('retorna o status de um erro do axios', () => {
    expect(getApiErrorStatus(axiosError(401))).toBe(401)
    expect(getApiErrorStatus(new Error('falha'))).toBeUndefined()
  })

  it('usa a mensagem do status', () => {
    expect(getApiErrorMessage(axiosError(409), { 409: 'Duplicado.' })).toBe('Duplicado.')
  })

  it('usa a mensagem genérica sem correspondência ou sem resposta', () => {
    const generic = 'Não foi possível concluir a solicitação. Tente novamente.'
    expect(getApiErrorMessage(axiosError(500), { 409: 'Duplicado.' })).toBe(generic)
    expect(getApiErrorMessage(new Error('Network Error'))).toBe(generic)
  })
})
