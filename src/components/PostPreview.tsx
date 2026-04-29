import React from 'react'
import { Post } from '../types'
import { createExcerpt } from 'postkit-excerpt'
import { readingTime, formatTime } from 'postkit-reading-time'
import { formatDate, statusToLabel } from 'postkit-date-status-display'
import { createSlugFromTitle } from 'postkit-slug'

interface PostPreviewProps {
  post: Post
  onEdit: () => void
  onBack: () => void
}

export default function PostPreview({ post, onEdit, onBack }: PostPreviewProps) {
  let slug = 'untitled'
  try { slug = createSlugFromTitle(post.title) } catch {}

  const excerpt = createExcerpt(post.body, 160)
  const minutes = readingTime(post.body)
  const readTime = formatTime(minutes)
  const date = formatDate(post.updatedAt) ?? formatDate(post.createdAt) ?? '—'
  const statusLabel = statusToLabel(post.status) ?? post.status

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <button onClick={onEdit}>Edit</button>

      <h2>{post.title}</h2>

      <p><strong>Slug:</strong> /{slug}</p>
      <p><strong>Status:</strong> {statusLabel}</p>
      <p><strong>Reading Time:</strong> {readTime}</p>
      <p><strong>Last Updated:</strong> {date}</p>
      <p><strong>Author:</strong> {post.author}</p>
      <p><strong>Category:</strong> {post.category || '—'}</p>

      {post.tags.length > 0 && (
        <p><strong>Tags:</strong> {post.tags.join(', ')}</p>
      )}

      <p><strong>Excerpt:</strong> {excerpt || '—'}</p>

      <hr />
      <p>{post.body}</p>
    </div>
  )
}