import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axiosError } from '../../test/axiosError.ts'
import { CommentForm } from './CommentForm.tsx'

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(<CommentForm label="Comentário" submitLabel="Comentar" onSubmit={onSubmit} />)
  return onSubmit
}

describe('CommentForm', () => {
  it('envia o texto sem espaços nas pontas e limpa o campo', async () => {
    const onSubmit = renderForm()
    const field = screen.getByLabelText('Comentário')

    await userEvent.type(field, '  Muito bom!  ')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
    expect(field).toHaveValue('')
  })

  it('não envia um comentário vazio', async () => {
    const onSubmit = renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Escreva um comentário.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mantém o texto e mostra o erro quando o envio falha', async () => {
    renderForm(vi.fn().mockRejectedValue(axiosError(500)))
    const field = screen.getByLabelText('Comentário')

    await userEvent.type(field, 'Muito bom!')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(field).toHaveValue('Muito bom!')
  })
})
