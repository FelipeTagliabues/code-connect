import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { NewPost } from '../../services/posts.ts'
import { Button } from '../atoms/Button.tsx'
import { Heading } from '../atoms/Heading.tsx'
import { Icon } from '../atoms/Icon.tsx'
import { Tag } from '../atoms/Tag.tsx'
import { FormField } from '../molecules/FormField.tsx'
import { PostThumbnail } from '../molecules/PostThumbnail.tsx'
import { TextareaField } from '../molecules/TextareaField.tsx'

const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_TAGS = 8

type PostFormErrors = {
  title?: string
  description?: string
  thumbnail?: string
}

type PostFormProps = {
  onSubmit: (post: NewPost) => void
  onDiscard: () => void
  error?: string
  loading?: boolean
}

export function PostForm({ onSubmit, onDiscard, error, loading = false }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<PostFormErrors>({})
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function withDraft(current: string[]): string[] {
    const tag = tagDraft.trim()
    const isDuplicate = current.some((item) => item.toLowerCase() === tag.toLowerCase())
    return !tag || isDuplicate || current.length >= MAX_TAGS ? current : [...current, tag]
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') return
    event.preventDefault()
    setTags(withDraft)
    setTagDraft('')
  }

  function handleFileChange(file: File | undefined) {
    if (!file) return
    if (!ACCEPTED_IMAGES.includes(file.type)) {
      setErrors((current) => ({ ...current, thumbnail: 'Envie uma imagem PNG, JPG ou WebP.' }))
    } else if (file.size > MAX_IMAGE_BYTES) {
      setErrors((current) => ({ ...current, thumbnail: 'A imagem deve ter até 5 MB.' }))
    } else {
      setErrors((current) => ({ ...current, thumbnail: undefined }))
      setThumbnail(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  function removeThumbnail() {
    setThumbnail(null)
    setPreviewUrl(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: PostFormErrors = {
      title: title.trim() ? undefined : 'Informe o nome do projeto.',
      description: description.trim() ? undefined : 'Informe a descrição.',
    }
    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.description) return

    const finalTags = withDraft(tags)
    setTags(finalTags)
    setTagDraft('')
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      code,
      tags: finalTags,
      thumbnail,
    })
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-lg bg-card p-4 md:p-8 xl:flex-row"
    >
      <div className="flex flex-col gap-4 xl:w-1/2">
        <PostThumbnail
          src={previewUrl}
          alt="Pré-visualização da imagem do projeto"
          size="detail"
          className="rounded-lg"
        />
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_IMAGES.join(',')}
          aria-label="Imagem do projeto"
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
        <Button variant="neutral" onClick={() => fileInput.current?.click()}>
          Carregar imagem
          <Icon name="upload" className="size-6" />
        </Button>
        {thumbnail && (
          <p className="flex items-center gap-2 text-sm text-input">
            <span className="min-w-0 truncate">{thumbnail.name}</span>
            <button
              type="button"
              aria-label="Remover imagem"
              onClick={removeThumbnail}
              className="cursor-pointer hover:text-offwhite focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Icon name="close" className="size-4" />
            </button>
          </p>
        )}
        {errors.thumbnail && (
          <p role="alert" className="text-sm text-error">
            {errors.thumbnail}
          </p>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-10">
        <Heading>Novo projeto</Heading>
        <div className="flex flex-col gap-6">
          <FormField
            label="Nome do projeto"
            maxLength={120}
            value={title}
            error={errors.title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextareaField
            label="Descrição"
            rows={6}
            maxLength={5000}
            value={description}
            error={errors.description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextareaField
            label="Código (opcional)"
            rows={6}
            maxLength={20000}
            spellCheck={false}
            className="font-mono"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <div className="flex flex-col gap-4">
            <FormField
              label="Tags"
              maxLength={30}
              placeholder="Digite e pressione Enter"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    selected
                    onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        <div className="flex gap-6">
          <Button variant="outline" onClick={onDiscard}>
            Descartar
            <Icon name="delete" className="size-6" />
          </Button>
          <Button type="submit" disabled={loading}>
            Publicar
            <Icon name="publish" className="size-6" />
          </Button>
        </div>
      </div>
    </form>
  )
}
