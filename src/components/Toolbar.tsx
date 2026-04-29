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

export default function Toolbar({
  searchQuery, onSearchChange,
  filterStatus, onFilterStatus,
  filterTag, onFilterTag,
  sortField, onSortField,
  sortDirection, onSortDirection,
}: ToolbarProps) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
      />

      <select value={filterStatus} onChange={e => onFilterStatus(e.target.value as PostStatus | '')}>
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="review">Review</option>
        <option value="published">Published</option>
      </select>

      <input
        type="text"
        placeholder="Filter by tag..."
        value={filterTag}
        onChange={e => onFilterTag(e.target.value)}
      />

      <select value={sortField} onChange={e => onSortField(e.target.value as 'date' | 'title')}>
        <option value="date">Sort by Date</option>
        <option value="title">Sort by Title</option>
      </select>

      <select value={sortDirection} onChange={e => onSortDirection(e.target.value as 'asc' | 'desc')}>
        {sortField === 'date' ? (
          <>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </>
        ) : (
          <>
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </>
        )}
      </select>
    </div>
  )
}