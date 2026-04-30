import React from 'react'
import { Post, PostStatus } from '../types'
import { createExcerpt, formatDate, statusToLabel } from '../workarounds'
import { readingTime, formatTime } from 'postkit-reading-time'
import { createSlugFromTitle } from 'postkit-slug'

interface PostPreviewProps {
  post: Post
  onEdit: () => void
  onBack: () => void
}

const STATUS_BADGE: Record<PostStatus, string> = {
  draft: 'bg-gray-100/95 text-gray-800',
  review: 'bg-amber-100/95 text-amber-900',
  published: 'bg-emerald-100/95 text-emerald-900',
}

export default function PostPreview({ post, onEdit, onBack }: PostPreviewProps) {
  let slug = 'untitled'
  try { slug = createSlugFromTitle(post.title) } catch {}

  const excerpt = createExcerpt(post.body, 160)
  const minutes = readingTime(post.body)
  const readTime = formatTime(minutes)
  const date = formatDate(post.updatedAt)
  const statusLabel = statusToLabel(post.status)

  return (
    <article className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onEdit}
          className="h-10 px-4 rounded-md bg-white text-slate-900 text-sm
                     font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-black/30"
        >
          Edit
        </button>
      </div>

      <div className="bg-slate-900/60 backdrop-blur rounded-lg shadow-2xl shadow-black/40 border border-white/10 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider
                          rounded-full backdrop-blur-sm ${STATUS_BADGE[post.status]}`}
            >
              {statusLabel}
            </span>
            <span className="text-xs text-slate-400">{readTime}</span>
            <span className="text-xs text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400">{date}</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight">
            {post.title}
          </h1>

          <p className="mt-2 text-sm text-yellow-300/80 font-mono">/{slug}</p>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] uppercase tracking-wider px-2 py-0.5
                             rounded-full bg-white/10 text-slate-200 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3
                        text-sm border-b border-white/10 bg-black/20">
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Author</dt>
            <dd className="mt-0.5 text-white">{post.author}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Category</dt>
            <dd className="mt-0.5 text-white">{post.category || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Excerpt</dt>
            <dd className="mt-0.5 text-slate-200 italic">{excerpt || '—'}</dd>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">
            {post.body}
          </p>
        </div>
      </div>
    </article>
  )
}
