import { Post, PostStatus } from './types'
 
// --- postkit-date-status-display workarounds ---
 
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
 
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
 
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
 
export function statusToLabel(status: PostStatus): string {
  const labels: Record<PostStatus, string> = {
    draft: 'Draft',
    review: 'In Review',
    published: 'Published',
  }
  return labels[status] ?? status
}
 
// --- postkit-excerpt workaround ---
 
export function createExcerpt(body: string, maxLength: number = 160): string {
  const cleaned = body.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}
 
// --- postkit-search-library workaround ---
 
export function searchPosts(posts: Post[], query: string): Post[] {
  const q = query.toLowerCase().trim()
  if (!q) return posts
  return posts.filter(post => {
    const text = [
      post.title,
      post.body,
      post.tags.join(' '),
    ].join(' ').toLowerCase()
    return text.includes(q)
  })
}
 