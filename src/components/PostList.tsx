import React from 'react'
import { Post } from '../types'
import { readingTime, formatTime } from 'postkit-reading-time'
import { formatRelativeDate, statusToLabel } from '../workarounds'

interface PostListProps {
  posts: Post[]
  onEdit: (post: Post) => void
  onPreview: (post: Post) => void
  onDelete: (id: string) => void
}

export default function PostList({ posts, onEdit, onPreview, onDelete }: PostListProps) {
  if (posts.length === 0) {
    return <p>No posts found.</p>
  }

  return (
    <ul>
      {posts.map(post => {
        const minutes = readingTime(post.body)
        const readTime = formatTime(minutes)
        const date = formatRelativeDate(post.updatedAt)
        const statusLabel = statusToLabel(post.status)

        return (
          <li key={post.id}>
            <strong>{post.title || 'Untitled'}</strong>
            <span> — {statusLabel}</span>
            <span> — {readTime}</span>
            <span> — {date}</span>
            <div>
              {post.tags.map(tag => <span key={tag}>[{tag}] </span>)}
            </div>
            <button onClick={() => onPreview(post)}>Preview</button>
            <button onClick={() => onEdit(post)}>Edit</button>
            <button onClick={() => { if (window.confirm('Delete this post?')) onDelete(post.id) }}>Delete</button>
          </li>
        )
      })}
    </ul>
  )
}