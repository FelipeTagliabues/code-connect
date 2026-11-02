import { useState } from 'react'
import type { Comment } from '../../services/posts.ts'
import { CommentForm } from '../molecules/CommentForm.tsx'
import { CommentItem } from '../molecules/CommentItem.tsx'

const textButton =
  'cursor-pointer text-card focus-visible:outline-2 focus-visible:outline-card hover:underline'

type ReplyableProps = {
  comment: Comment
  canReply: boolean
  onReply: (content: string, parentId: string) => Promise<void>
  onReplied: () => void
}

function ReplyableComment({ comment, canReply, onReply, onReplied }: ReplyableProps) {
  const [replying, setReplying] = useState(false)

  async function handleSubmit(content: string) {
    await onReply(content, comment.id)
    setReplying(false)
    onReplied()
  }

  return (
    <div className="flex flex-col gap-2">
      <CommentItem authorName={comment.author.name} content={comment.content} />
      {canReply && !replying && (
        <button
          type="button"
          onClick={() => setReplying(true)}
          className={`self-start text-sm font-semibold ${textButton}`}
        >
          Responder
        </button>
      )}
      {replying && (
        <CommentForm
          label={`Responder a ${comment.author.name}`}
          submitLabel="Responder"
          onSubmit={handleSubmit}
          onCancel={() => setReplying(false)}
        />
      )}
    </div>
  )
}

type CommentThreadProps = {
  comment: Comment
  canReply: boolean
  onReply: (content: string, parentId: string) => Promise<void>
}

export function CommentThread({ comment, canReply, onReply }: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <ReplyableComment
        comment={comment}
        canReply={canReply}
        onReply={onReply}
        onReplied={() => setShowReplies(true)}
      />
      {comment.replies.length > 0 && (
        <button
          type="button"
          aria-expanded={showReplies}
          onClick={() => setShowReplies((current) => !current)}
          className={`flex items-center gap-2 self-start text-xs ${textButton}`}
        >
          <span aria-hidden="true" className="h-px w-8 bg-card" />
          {showReplies ? 'Ocultar respostas' : 'Ver respostas'}
        </button>
      )}
      {showReplies && (
        <ul className="flex flex-col gap-2 pl-10">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <ReplyableComment
                comment={reply}
                canReply={canReply}
                onReply={onReply}
                onReplied={() => setShowReplies(true)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
