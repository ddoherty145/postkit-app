import React, { useState, useEffect } from 'react'
import { Post, PostStatus } from './types'
import { loadPosts, savePosts, exportPosts, importPosts } from 'postkit-storage-lib'
import { searchPosts } from 'postkit-search-library'
import { filterByStatus, filterByTag, sortByDate, sortByTitle } from 'postkit-filter-sort'
import PostList from './components/PostList'
import PostEditor from './components/PostEditor'
import PostPreview from './components/PostPreview'
import Toolbar from './components/Toolbar'

const STORAGE_KEY = 'postkit-posts'

type View = 'list' | 'editor' | 'preview'

export default function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [view, setView] = useState<View>('list')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<PostStatus | ''>('')
  const [filterTag, setFilterTag] = useState('')
  const [sortField, setSortField] = useState<'date' | 'title'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Load posts on mount
  useEffect(() => {
    const loaded = loadPosts(STORAGE_KEY)
    setPosts(loaded)
  }, [])

  // Save whenever posts change
  useEffect(() => {
    savePosts(STORAGE_KEY, posts)
  }, [posts])

  const handleSavePost = (post: Post) => {
    setPosts(prev => {
      const exists = prev.find(p => p.id === post.id)
      return exists ? prev.map(p => p.id === post.id ? post : p) : [...prev, post]
    })
    setView('list')
  }

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    setView('list')
  }

  const handleExport = () => {
    const json = exportPosts(posts)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'postkit-posts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const imported = importPosts(reader.result as string)
      if (imported.length === 0) {
        alert('Could not import that file. Make sure it was exported from PostKit.')
      } else {
        setPosts(imported)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const getDisplayedPosts = (): Post[] => {
    let result = [...posts]
    if (searchQuery.trim()) result = searchPosts(result, searchQuery)
    if (filterStatus) result = filterByStatus(result, filterStatus)
    if (filterTag.trim()) result = filterByTag(result, filterTag)
    result = sortField === 'date'
      ? sortByDate(result, sortDirection)
      : sortByTitle(result, sortDirection)
    return result
  }

  return (
    <div>
      <header>
        <h1>PostKit</h1>
        <div>
          <button onClick={handleExport}>Export</button>
          <label>
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button onClick={() => { setSelectedPost(null); setView('editor') }}>+ New Post</button>
        </div>
      </header>

      <main>
        {view === 'list' && (
          <>
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterStatus={setFilterStatus}
              filterTag={filterTag}
              onFilterTag={setFilterTag}
              sortField={sortField}
              onSortField={setSortField}
              sortDirection={sortDirection}
              onSortDirection={setSortDirection}
            />
            <PostList
              posts={getDisplayedPosts()}
              onEdit={post => { setSelectedPost(post); setView('editor') }}
              onPreview={post => { setSelectedPost(post); setView('preview') }}
              onDelete={handleDeletePost}
            />
          </>
        )}

        {view === 'editor' && (
          <PostEditor
            post={selectedPost}
            allPosts={posts}
            onSave={handleSavePost}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'preview' && selectedPost && (
          <PostPreview
            post={selectedPost}
            onEdit={() => setView('editor')}
            onBack={() => setView('list')}
          />
        )}
      </main>
    </div>
  )
}