import React, { useState, useEffect } from 'react'
import { Post, PostStatus } from '../types'
import { getPostValidationErrors } from 'postkit-validation-library'
import { parseTags, removeDuplicateTags } from 'postkit-tag'
import { createSlugFromTitle, makeUniqueSlug } from 'postkit-slug'

interface PostEditorProps {
  post: Post | null
  allPosts: Post[]
  onSave: (post: Post) => void
  onCancel: () => void
}

export default function PostEditor({ post, allPosts, onSave, onCancel }: PostEditorProps) {
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

    // Generate a unique slug from title
    let slug = ''
    try {
      const base = createSlugFromTitle(title)
      const otherSlugs = allPosts
        .filter(p => p.id !== post?.id)
        .map(p => { try { return createSlugFromTitle(p.title) } catch { return '' } })
        .filter(Boolean)
      slug = makeUniqueSlug(base, otherSlugs)
    } catch {
      // title may be empty — validation will catch it
    }

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
    <div>
      <button onClick={onCancel}>← Back</button>
      <h2>{post ? 'Edit Post' : 'New Post'}</h2>

      {errors.length > 0 && (
        <div>
          {errors.map((e, i) => <p key={i} style={{ color: 'red' }}>⚠ {e}</p>)}
        </div>
      )}

      <div>
        <label>Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" />
      </div>

      <div>
        <label>Author *</label>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
      </div>

      <div>
        <label>Category</label>
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
      </div>

      <div>
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as PostStatus)}>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div>
        <label>Tags (comma separated)</label>
        <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="e.g. typescript, react" />
      </div>

      <div>
        <label>Body *</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your post..." rows={12} />
      </div>

      <button onClick={onCancel}>Cancel</button>
      <button onClick={handleSave}>Save Post</button>
    </div>
  )
}