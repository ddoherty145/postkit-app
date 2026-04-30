import React from 'react'
import { Post } from '../types'
import PostCard from './PostCard'

interface PostListProps {
  posts: Post[]
  onEdit: (post: Post) => void
  onPreview: (post: Post) => void
  onDelete: (id: string) => void
}

export default function PostList({ posts, onEdit, onPreview, onDelete }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center
                      rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
        <div className="text-5xl mb-4 text-slate-600">·</div>
        <h2 className="text-lg font-semibold text-white">No posts found</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-sm">
          Adjust your search or filters, or create a new post to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onPreview={onPreview}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
