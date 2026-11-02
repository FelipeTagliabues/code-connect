import { useState } from 'react'
import { Icon } from '../atoms/Icon.tsx'

const sizes = {
  feed: 'p-6 [&>*]:h-48',
  detail: 'px-4 py-6 [&>*]:h-80',
}

type PostThumbnailProps = {
  src: string | null
  alt: string
  size?: keyof typeof sizes
  className?: string
}

export function PostThumbnail({
  src,
  alt,
  size = 'feed',
  className = 'rounded-t-lg',
}: PostThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src !== null && src !== failedSrc

  return (
    <div className={`w-full bg-input ${sizes[size]} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailedSrc(src)}
          className="w-full rounded-lg object-cover shadow-editor"
        />
      ) : (
        <div
          role="img"
          aria-label="Post sem imagem"
          className="flex w-full items-center justify-center rounded-lg bg-card text-input shadow-editor"
        >
          <Icon name="image" className="size-16" />
        </div>
      )}
    </div>
  )
}
