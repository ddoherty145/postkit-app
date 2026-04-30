import React, { useState, useEffect } from 'react'
import { Post, PostStatus } from '../types'
import { getPostValidationErrors } from 'postkit-validation-library'
import { parseTags, removeDuplicateTags } from 'postkit-tag'

interface PostEditorProps {
  post: Post | null
  onSave: (post: Post) => void
  onCancel: () => void
}

const labelClasses = 'block text-sm font-medium text-slate-300 mb-1.5'
const inputClasses =
  'w-full h-10 px-3 rounded-md border border-white/15 bg-white/5 text-sm text-white ' +
  'placeholder:text-slate-500 backdrop-blur ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-300/40 focus:border-yellow-300/60'
const selectInputClasses = `dark-select ${inputClasses}`
const textareaClasses =
  'w-full px-3 py-2 rounded-md border border-white/15 bg-white/5 text-sm text-white ' +
  'placeholder:text-slate-500 backdrop-blur ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-300/40 focus:border-yellow-300/60'

export default function PostEditor({ post, onSave, onCancel }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [author, setAuthor] = useState(post?.author ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft')
  const [tagInput, setTagInput] = useState(post?.tags.join(', ') ?? '')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setBody(post.body)
      setAuthor(post.author)
      setCategory(post.category)
      setStatus(post.status)
      setTagInput(post.tags.join(', '))
    }
  }, [post])

  const handleSave = () => {
    const tags = removeDuplicateTags(parseTags(tagInput))
    const now = new Date().toISOString()

    const fullPost: Post = {
      id: post?.id ?? crypto.randomUUID(),
      title,
      body,
      author,
      tags,
      category,
      status,
      createdAt: post?.createdAt ?? now,
      updatedAt: now,
    }

    const issues = getPostValidationErrors(fullPost)
    if (issues.length > 0) {
      setErrors(issues.map(i => i.message))
      return
    }

    setErrors([])
    onSave(fullPost)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onCancel}
        className="text-sm text-slate-400 hover:text-white transition-colors mb-4"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-6">
        {post ? 'Edit Post' : 'New Post'}
      </h2>

      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 backdrop-blur p-4">
          <p className="text-sm font-semibold text-red-200 mb-1">
            Please fix the following:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e, i) => (
              <li key={i} className="text-sm text-red-200/90">{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur rounded-lg shadow-2xl shadow-black/40 border border-white/10 p-6 space-y-5">
        <div>
          <label className={labelClasses}>Title <span className="text-red-400">*</span></label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post title"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>Author <span className="text-red-400">*</span></label>
            <input
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Author name"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Category"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as PostStatus)}
              className={selectInputClasses}
            >
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Tags (comma separated)</label>
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="e.g. typescript, react"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Body <span className="text-red-400">*</span></label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your post…"
            rows={14}
            className={textareaClasses}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="h-10 px-4 rounded-md border border-white/15 bg-white/5 text-sm
                     font-medium text-white hover:bg-white/10 transition-colors backdrop-blur"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="h-10 px-4 rounded-md bg-white text-slate-900 text-sm
                     font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-black/30"
        >
          Save Post
        </button>
      </div>
    </div>
  )
}
