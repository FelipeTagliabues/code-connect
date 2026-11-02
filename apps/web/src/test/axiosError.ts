import { AxiosError, type AxiosResponse } from 'axios'

export function axiosError(status: number): AxiosError {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
  } as AxiosResponse)
}
