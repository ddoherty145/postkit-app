import React, { useState } from 'react'
import { Post, PostStatus } from '../types'
import { readingTime, formatTime } from 'postkit-reading-time'
import { createExcerpt, formatRelativeDate, statusToLabel } from '../workarounds'

interface PostCardProps {
  post: Post
  onEdit: (post: Post) => void
  onPreview: (post: Post) => void
  onDelete: (id: string) => void
}

const STATUS_BADGE: Record<PostStatus, string> = {
  draft: 'bg-gray-100/95 text-gray-800',
  review: 'bg-amber-100/95 text-amber-900',
  published: 'bg-emerald-100/95 text-emerald-900',
}

// Pick one of a handful of gradients deterministically from the post id so the
// background looks intentional (and serves as a fallback if the network image fails).
const FALLBACK_GRADIENTS = [
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-sky-500 via-cyan-500 to-emerald-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-fuchsia-500 via-violet-500 to-blue-500',
  'from-teal-500 via-emerald-500 to-lime-500',
  'from-rose-500 via-red-500 to-orange-500',
]

function gradientFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]
}

export default function PostCard({ post, onEdit, onPreview, onDelete }: PostCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const minutes = readingTime(post.body)
  const readTime = formatTime(minutes)
  const date = formatRelativeDate(post.updatedAt)
  const statusLabel = statusToLabel(post.status)
  const excerpt = createExcerpt(post.body, 140) || 'No content yet.'
  const gradient = gradientFor(post.id)
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(post.id)}/800/600`

  return (
    <article
      className={`group gpu relative overflow-hidden rounded-lg shadow-lg
                  h-48 md:h-80 bg-gradient-to-br ${gradient}
                  transition-shadow duration-300 hover:shadow-2xl`}
    >
      {!imageFailed && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover gpu
                     transition-transform duration-3000 ease-out
                     md:group-hover:scale-110"
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none
                   bg-gradient-to-b from-transparent via-transparent to-black/80"
      />

      <span
        className={`absolute top-3 right-3 z-20 px-2.5 py-1 text-[10px] font-semibold
                    uppercase tracking-wider rounded-full backdrop-blur-sm
                    ${STATUS_BADGE[post.status]}`}
      >
        {statusLabel}
      </span>

      <div
        className="absolute inset-x-0 bottom-0 p-4 text-white z-10
                   transition-colors duration-1000 md:group-hover:bg-black/60"
      >
        <h2
          className="text-lg md:text-xl font-semibold leading-tight
                     transition-colors duration-1000 md:group-hover:text-yellow-300
                     line-clamp-2"
        >
          {post.title || 'Untitled'}
        </h2>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-200">
          <span>{date}</span>
          <span aria-hidden="true">·</span>
          <span>{readTime}</span>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider px-1.5 py-0.5
                           rounded bg-white/15 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="overflow-hidden transition-all ease-out
                     max-h-96 opacity-100
                     md:max-h-0 md:opacity-0 md:duration-1500
                     md:group-hover:max-h-96 md:group-hover:opacity-100"
        >
          <p className="mt-3 text-sm font-light text-gray-100 line-clamp-3">
            {excerpt}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 relative z-20">
            <button
              type="button"
              onClick={() => onPreview(post)}
              className="px-3 py-1.5 rounded text-xs font-medium border border-white/30
                         bg-white/10 hover:bg-white/25 transition-colors"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="px-3 py-1.5 rounded text-xs font-medium border border-white/30
                         bg-white/10 hover:bg-white/25 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this post?')) onDelete(post.id)
              }}
              className="px-3 py-1.5 rounded text-xs font-medium border border-red-300/40
                         bg-red-500/20 hover:bg-red-500/40 transition-colors ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
