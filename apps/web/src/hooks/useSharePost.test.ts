import { act, renderHook } from '@testing-library/react'
import { buildPost } from '../test/fixtures.ts'
import { useSharePost } from './useSharePost.ts'

describe('useSharePost', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function share() {
    const { result } = renderHook(() => useSharePost())
    await act(() => result.current.sharePost(buildPost()))
    return result.current.shareMessage
  }

  it('usa o compartilhamento nativo quando existe', async () => {
    const nativeShare = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share: nativeShare, clipboard: { writeText } })

    expect(await share()).toBeUndefined()
    expect(nativeShare).toHaveBeenCalledWith({
      title: 'Título do post',
      url: expect.stringContaining('/posts/post-1'),
    })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('não faz nada quando a pessoa fecha a janela de compartilhamento', async () => {
    const nativeShare = vi.fn().mockRejectedValue(new DOMException('', 'AbortError'))
    vi.stubGlobal('navigator', { share: nativeShare, clipboard: { writeText } })

    expect(await share()).toBeUndefined()
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copia o link quando o compartilhamento nativo falha', async () => {
    const nativeShare = vi.fn().mockRejectedValue(new DOMException('', 'NotAllowedError'))
    vi.stubGlobal('navigator', { share: nativeShare, clipboard: { writeText } })

    expect(await share()).toBe('Link copiado!')
    expect(writeText).toHaveBeenCalledOnce()
  })

  it('avisa quando não consegue copiar', async () => {
    writeText.mockRejectedValue(new Error('negado'))

    expect(await share()).toBe('Não foi possível copiar o link.')
  })
})
