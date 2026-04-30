import React, { useState, useEffect } from 'react'
import { Post, PostStatus } from './types'
import { loadPosts, savePosts, exportPosts, importPosts } from 'postkit-storage-lib'
import { searchPosts } from './workarounds'
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

  useEffect(() => {
    const loaded = loadPosts(STORAGE_KEY)
    setPosts(loaded)
  }, [])

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

  const secondaryBtn =
    'inline-flex items-center h-10 px-4 rounded-md border border-white/15 ' +
    'bg-white/5 text-sm font-medium text-white hover:bg-white/10 ' +
    'transition-colors cursor-pointer backdrop-blur'

  const primaryBtn =
    'inline-flex items-center h-10 px-4 rounded-md bg-white text-slate-900 ' +
    'text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-black/30'

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">
            <span className="text-yellow-300">Post</span>Kit
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className={secondaryBtn}>
              Export
            </button>
            <label className={secondaryBtn}>
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => { setSelectedPost(null); setView('editor') }}
              className={primaryBtn}
            >
              + New Post
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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