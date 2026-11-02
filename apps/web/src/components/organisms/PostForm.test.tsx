import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostForm } from './PostForm.tsx'

function renderForm() {
  const onSubmit = vi.fn()
  const onDiscard = vi.fn()
  render(<PostForm onSubmit={onSubmit} onDiscard={onDiscard} />)
  return { onSubmit, onDiscard }
}

function publish() {
  return userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
}

describe('PostForm', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('exige o nome e a descrição', async () => {
    const { onSubmit } = renderForm()
    await publish()
    expect(screen.getByText('Informe o nome do projeto.')).toBeInTheDocument()
    expect(screen.getByText('Informe a descrição.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os dados, com as tags sem repetição', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Nome do projeto'), ' Nome ')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Texto')
    await userEvent.type(screen.getByLabelText('Código (opcional)'), 'a = 1')
    const tags = screen.getByLabelText('Tags')
    await userEvent.type(tags, 'UI{Enter}ui{Enter}CSS,Go')
    await publish()

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Nome',
      description: 'Texto',
      code: 'a = 1',
      tags: ['UI', 'CSS', 'Go'],
      thumbnail: null,
    })
  })

  it('remove uma tag ao clicar nela', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('Tags'), 'React{Enter}')
    await userEvent.click(screen.getByRole('button', { name: 'React' }))
    expect(screen.queryByRole('button', { name: 'React' })).not.toBeInTheDocument()
  })

  it('começa com o placeholder e mostra a imagem escolhida', async () => {
    const { onSubmit } = renderForm()
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()

    const file = new File(['x'], 'projeto.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText('Imagem do projeto'), file)

    expect(screen.getByRole('img', { name: /Pré-visualização/ })).toHaveAttribute(
      'src',
      'blob:preview',
    )
    expect(screen.getByText('projeto.png')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Nome do projeto'), 'Nome')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição')
    await publish()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ thumbnail: file }))
  })

  it('remove a imagem escolhida', async () => {
    renderForm()
    const file = new File(['x'], 'projeto.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText('Imagem do projeto'), file)

    await userEvent.click(screen.getByRole('button', { name: 'Remover imagem' }))

    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('recusa um arquivo que não é imagem', async () => {
    renderForm()
    const file = new File(['x'], 'nota.txt', { type: 'text/plain' })
    await userEvent.upload(screen.getByLabelText('Imagem do projeto'), file, {
      applyAccept: false,
    })
    expect(screen.getByRole('alert')).toHaveTextContent('PNG, JPG ou WebP')
    expect(screen.queryByText('nota.txt')).not.toBeInTheDocument()
  })

  it('recusa uma imagem acima de 5 MB', async () => {
    renderForm()
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', {
      type: 'image/png',
    })
    await userEvent.upload(screen.getByLabelText('Imagem do projeto'), file)
    expect(screen.getByRole('alert')).toHaveTextContent('até 5 MB')
  })

  it('avisa ao descartar', async () => {
    const { onDiscard } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(onDiscard).toHaveBeenCalledOnce()
  })
})
