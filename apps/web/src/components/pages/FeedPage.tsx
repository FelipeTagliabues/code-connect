import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useSession } from '../../hooks/useSession.ts'
import { useSharePost } from '../../hooks/useSharePost.ts'
import { useToggleLike } from '../../hooks/useToggleLike.ts'
import { getApiErrorMessage } from '../../services/apiError.ts'
import { listPosts, listTags, type Post, type PostSort } from '../../services/posts.ts'
import { Button } from '../atoms/Button.tsx'
import { PostCard } from '../organisms/PostCard.tsx'
import { PostFilters } from '../organisms/PostFilters.tsx'
import { PostTabs } from '../organisms/PostTabs.tsx'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 300

/** A API só conhece `q`: cada chip é um termo da busca, entre aspas para valer inteiro. */
function buildSearchQuery(text: string, tags: string[]): string {
  const quoted = tags.map((tag) => `"${tag.replaceAll('"', '')}"`)
  return [text, ...quoted].join(' ').trim()
}

export function FeedPage() {
  const { isAuthenticated } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('q') ?? ''
  const selectedTags = searchParams.getAll('tag')
  const sort: PostSort = searchParams.get('sort') === 'popular' ? 'popular' : 'recent'

  const [search, setSearch] = useState(urlSearch)
  const [syncedUrlSearch, setSyncedUrlSearch] = useState(urlSearch)
  const [posts, setPosts] = useState<Post[]>([])
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(false)

  // Voltar ou avançar no navegador muda a URL sem passar pelo campo.
  if (urlSearch !== syncedUrlSearch) {
    setSyncedUrlSearch(urlSearch)
    setSearch(urlSearch)
  }

  const query = buildSearchQuery(urlSearch, selectedTags)
  const listKey = JSON.stringify([query, sort, isAuthenticated])
  const [requested, setRequested] = useState({ listKey, page: 1 })
  const page = requested.listKey === listKey ? requested.page : 1

  // Carregamento e erro valem só para a requisição atual, identificada pela chave.
  const requestKey = `${listKey}:${page}`
  const [settledKey, setSettledKey] = useState<string>()
  const [failure, setFailure] = useState<{ key: string; message: string }>()
  const loading = settledKey !== requestKey
  const error = failure?.key === requestKey ? failure.message : undefined

  const { toggleLike, likeError } = useToggleLike((updated) =>
    setPosts((current) =>
      current.map((post) => (post.id === updated.id ? updated : post)),
    ),
  )
  const { sharePost, shareMessage } = useSharePost()

  useEffect(() => {
    const controller = new AbortController()
    listTags(controller.signal)
      .then((tags) => setPopularTags(tags.map((tag) => tag.name)))
      .catch(() => {
        // Sem os chips, a busca por texto continua funcionando.
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (search === urlSearch) return
    const timer = setTimeout(() => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (search) next.set('q', search)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search, urlSearch, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    listPosts({ q: query, sort, page, limit: PAGE_SIZE }, controller.signal)
      .then(({ data, meta }) => {
        setPosts((current) => {
          if (page === 1) return data
          const known = new Set(current.map((post) => post.id))
          return [...current, ...data.filter((post) => !known.has(post.id))]
        })
        setHasMore(meta.page < meta.totalPages)
        setSettledKey(requestKey)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setFailure({ key: requestKey, message: getApiErrorMessage(err) })
        setSettledKey(requestKey)
      })
    return () => controller.abort()
  }, [query, sort, page, isAuthenticated, requestKey])

  function updateParams(change: (params: URLSearchParams) => void) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      change(next)
      return next
    })
  }

  function handleToggleTag(tag: string) {
    updateParams((params) => {
      const tags = params.getAll('tag')
      params.delete('tag')
      const nextTags = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag]
      nextTags.forEach((item) => params.append('tag', item))
    })
  }

  function handleSortChange(value: PostSort) {
    updateParams((params) => {
      if (value === 'popular') params.set('sort', value)
      else params.delete('sort')
    })
  }

  function handleClear() {
    setSearch('')
    updateParams((params) => {
      params.delete('q')
      params.delete('tag')
    })
  }

  const showInitialLoading = loading && page === 1 && posts.length === 0
  const showEmpty = !loading && !error && posts.length === 0

  return (
    <div className="flex flex-col gap-14">
      <h1 className="sr-only">Feed de posts</h1>
      <PostFilters
        search={search}
        onSearchChange={setSearch}
        tags={popularTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClear={handleClear}
      />

      <div className="flex flex-col gap-8">
        <PostTabs value={sort} onChange={handleSortChange} />

        {likeError && (
          <p role="alert" className="text-sm text-error">
            {likeError}
          </p>
        )}
        {shareMessage && (
          <p role="status" className="text-center text-sm text-primary">
            {shareMessage}
          </p>
        )}
        {showInitialLoading && <p role="status">Carregando...</p>}
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        {showEmpty && <p className="text-center text-lg">Nenhum post encontrado.</p>}

        {posts.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  onLike={(target) => void toggleLike(target)}
                  onShare={(target) => void sharePost(target)}
                />
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setRequested({ listKey, page: page + 1 })}
          >
            Carregar mais
          </Button>
        )}
      </div>
    </div>
  )
}
