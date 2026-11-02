import type { Comment, Post } from '../services/posts.ts'

export function buildPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    title: 'Título do post',
    description: 'Descrição do post',
    code: 'const a = 1',
    thumbnailUrl: '/posts/post-1.png',
    tags: ['React'],
    author: { id: 'autor-1', name: 'Julio Andrade' },
    likesCount: 12,
    commentsCount: 3,
    likedByMe: false,
    createdAt: '2026-11-02T00:00:00.000Z',
    ...overrides,
  }
}

export function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'comentario-1',
    parentId: null,
    content: 'Muito bom!',
    author: { id: 'autor-2', name: 'Marcia Ribeiro' },
    replies: [],
    createdAt: '2026-11-02T00:00:00.000Z',
    ...overrides,
  }
}
