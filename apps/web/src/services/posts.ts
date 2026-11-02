import { api } from './api.ts'

export type Author = {
  id: string
  name: string
}

export type Post = {
  id: string
  title: string
  description: string
  code: string | null
  thumbnailUrl: string | null
  tags: string[]
  author: Author
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  createdAt: string
}

export type Comment = {
  id: string
  parentId: string | null
  content: string
  author: Author
  replies: Comment[]
  createdAt: string
}

export type Tag = {
  name: string
  postsCount: number
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Page<T> = {
  data: T[]
  meta: PaginationMeta
}

export type PostSort = 'recent' | 'popular'

export type ListPostsParams = {
  q?: string
  sort: PostSort
  page: number
  limit: number
}

export type NewPost = {
  title: string
  description: string
  code: string
  tags: string[]
  thumbnail: File | null
}

const UPLOADS_PREFIX = '/uploads/'

/** Uploads ficam na API; as imagens do seed, no `public/` do front. */
export function resolveImageUrl(url: string | null): string | null {
  return url?.startsWith(UPLOADS_PREFIX) ? `${api.defaults.baseURL}${url}` : url
}

export async function listPosts(
  { q, ...params }: ListPostsParams,
  signal?: AbortSignal,
): Promise<Page<Post>> {
  const { data } = await api.get<Page<Post>>('/posts', {
    params: q ? { q, ...params } : params,
    signal,
  })
  return data
}

export async function getPost(id: string, signal?: AbortSignal): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${id}`, { signal })
  return data
}

export async function createPost({
  title,
  description,
  code,
  tags,
  thumbnail,
}: NewPost): Promise<Post> {
  const form = new FormData()
  form.append('title', title)
  form.append('description', description)
  if (code.trim()) form.append('code', code)
  tags.forEach((tag) => form.append('tags', tag))
  if (thumbnail) form.append('thumbnail', thumbnail)

  const { data } = await api.post<Post>('/posts', form)
  return data
}

export async function likePost(id: string): Promise<void> {
  await api.post(`/posts/${id}/likes`)
}

export async function unlikePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}/likes`)
}

export async function listComments(
  postId: string,
  page: number,
  signal?: AbortSignal,
): Promise<Page<Comment>> {
  const { data } = await api.get<Page<Comment>>(`/posts/${postId}/comments`, {
    params: { page },
    signal,
  })
  return data
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string,
): Promise<Comment> {
  const { data } = await api.post<Comment>(`/posts/${postId}/comments`, {
    content,
    parentId,
  })
  return data
}

export async function listTags(signal?: AbortSignal): Promise<Tag[]> {
  const { data } = await api.get<{ data: Tag[] }>('/tags', {
    params: { limit: 8 },
    signal,
  })
  return data.data
}
