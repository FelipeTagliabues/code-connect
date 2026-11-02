import { toHandle } from '../../utils/handle.ts'
import { Avatar } from '../atoms/Avatar.tsx'

type CommentItemProps = {
  authorName: string
  content: string
}

export function CommentItem({ authorName, content }: CommentItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-card">
      <Avatar name={authorName} />
      <p className="min-w-0 break-words whitespace-pre-line">
        <span className="mr-2 font-semibold">{toHandle(authorName)}</span>
        {content}
      </p>
    </div>
  )
}
