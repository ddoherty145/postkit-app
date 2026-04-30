import React from 'react'
import { PostStatus } from '../types'

interface ToolbarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  filterStatus: PostStatus | ''
  onFilterStatus: (v: PostStatus | '') => void
  filterTag: string
  onFilterTag: (v: string) => void
  sortField: 'date' | 'title'
  onSortField: (v: 'date' | 'title') => void
  sortDirection: 'asc' | 'desc'
  onSortDirection: (v: 'asc' | 'desc') => void
}

const inputClasses =
  'h-10 px-3 rounded-md border border-white/15 bg-white/5 text-sm text-white ' +
  'placeholder:text-slate-500 backdrop-blur ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-300/40 focus:border-yellow-300/60'

const selectClasses =
  'dark-select h-10 px-3 rounded-md border border-white/15 bg-white/5 text-sm text-white ' +
  'backdrop-blur ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-300/40 focus:border-yellow-300/60'

export default function Toolbar({
  searchQuery, onSearchChange,
  filterStatus, onFilterStatus,
  filterTag, onFilterTag,
  sortField, onSortField,
  sortDirection, onSortDirection,
}: ToolbarProps) {
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <input
        type="text"
        placeholder="Search posts…"
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className={`${inputClasses} lg:col-span-2`}
      />

      <select
        value={filterStatus}
        onChange={e => onFilterStatus(e.target.value as PostStatus | '')}
        className={selectClasses}
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="review">In Review</option>
        <option value="published">Published</option>
      </select>

      <input
        type="text"
        placeholder="Filter by tag…"
        value={filterTag}
        onChange={e => onFilterTag(e.target.value)}
        className={inputClasses}
      />

      <div className="flex gap-2">
        <select
          value={sortField}
          onChange={e => onSortField(e.target.value as 'date' | 'title')}
          className={`${selectClasses} flex-1`}
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
        </select>

        <select
          value={sortDirection}
          onChange={e => onSortDirection(e.target.value as 'asc' | 'desc')}
          className={`${selectClasses} flex-1`}
        >
          {sortField === 'date' ? (
            <>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </>
          ) : (
            <>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </>
          )}
        </select>
      </div>
    </div>
  )
}
