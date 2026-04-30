import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { Post } from './types'

// ─── localStorage mock ────────────────────────────────────────────────────────
// Accepts optional initialData written directly into the store (bypassing the
// spy) so tests can pre-seed stored posts without going through the UI.

function buildLocalStorageMock(initialData: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initialData }
  return {
    getItem: jest.fn((key: string): string | null => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(k => delete store[k])
    }),
  }
}

function installLocalStorageMock(initialData: Record<string, string> = {}) {
  const mock = buildLocalStorageMock(initialData)
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  })
  return mock
}

// ─── Shared one-time setup ────────────────────────────────────────────────────

beforeAll(() => {
  // jsdom 16 (jest 27 / react-scripts 5) ships without crypto.randomUUID and
  // window.crypto may be a non-extensible host object. Define a polyfill on
  // the global object so PostEditor's crypto.randomUUID() call resolves.
  let counter = 0
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    value: { randomUUID: () => `test-uuid-${++counter}` },
  })
})

// ─── Suite 1: post persistence across remount ─────────────────────────────────

describe('App – post persistence across remount', () => {
  let localStorageMock: ReturnType<typeof buildLocalStorageMock>

  beforeEach(() => {
    localStorageMock = installLocalStorageMock()
  })

  it('persists a saved post after the App is unmounted and remounted', async () => {
    // ── First mount ──────────────────────────────────────────────────────────
    const { unmount } = render(<App />)

    // Open the post editor via the header button.
    userEvent.click(screen.getByText('+ New Post'))

    // Fill in every required field (title, author, body).
    userEvent.type(screen.getByPlaceholderText('Post title'), 'My Persisted Post')
    userEvent.type(screen.getByPlaceholderText('Author name'), 'Test Author')
    userEvent.type(
      screen.getByPlaceholderText('Write your post…'),
      'Body text long enough to satisfy validation.',
    )

    // Submit the form – this calls onSave → handleSavePost → setPosts + setView('list').
    userEvent.click(screen.getByText('Save Post'))

    // The list view renders a PostCard whose title is the post title.
    await waitFor(() => {
      expect(screen.getByText('My Persisted Post')).toBeInTheDocument()
    })

    // The useEffect that calls savePosts should have written the post to the
    // mock store by now (it fires after every posts-state change).
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'postkit-posts',
      expect.stringContaining('My Persisted Post'),
    )

    // ── Unmount ──────────────────────────────────────────────────────────────
    unmount()

    // ── Second mount ─────────────────────────────────────────────────────────
    // The mock store still contains the serialised post.
    // App's loadPosts useEffect calls localStorage.getItem, which the mock
    // resolves from the same in-memory store, making the post reappear.
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('My Persisted Post')).toBeInTheDocument()
    })

    // localStorage.getItem should have been called during the second mount's
    // initialisation (the loadPosts useEffect).
    expect(localStorageMock.getItem).toHaveBeenCalledWith('postkit-posts')
  })
})

// ─── Suite 2: status filter ───────────────────────────────────────────────────

describe('App – status filter', () => {
  const STORAGE_KEY = 'postkit-posts'

  // Three posts, one per status, with distinct titles.
  const seedPosts: Post[] = [
    {
      id: 'seed-draft',
      title: 'Draft Post',
      body: 'Some body text.',
      author: 'Author A',
      tags: [],
      category: '',
      status: 'draft',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'seed-review',
      title: 'Review Post',
      body: 'Some body text.',
      author: 'Author B',
      tags: [],
      category: '',
      status: 'review',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'seed-published',
      title: 'Published Post',
      body: 'Some body text.',
      author: 'Author C',
      tags: [],
      category: '',
      status: 'published',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    // Pre-seed the mock store so App loads all three posts on mount without
    // any UI interaction.
    installLocalStorageMock({ [STORAGE_KEY]: JSON.stringify(seedPosts) })
  })

  it('shows only draft posts when the Draft status filter is selected', async () => {
    render(<App />)

    // All three posts should be visible before any filter is applied.
    // Wait for one post to confirm the async loadPosts effect has resolved,
    // then assert the others synchronously — they arrive in the same render.
    await screen.findByText('Draft Post')
    expect(screen.getByText('Review Post')).toBeInTheDocument()
    expect(screen.getByText('Published Post')).toBeInTheDocument()

    // The status filter select starts on "All Statuses" (value="").
    // Select the "Draft" option by its option value.
    userEvent.selectOptions(screen.getByDisplayValue('All Statuses'), 'draft')

    // Only the draft card should remain; the other two should be removed from
    // the DOM entirely (PostList renders nothing for filtered-out posts).
    // Wait for one non-draft post to disappear — that signals the re-render is
    // complete — then assert the remaining conditions synchronously.
    await waitFor(() => expect(screen.queryByText('Review Post')).not.toBeInTheDocument())
    expect(screen.getByText('Draft Post')).toBeInTheDocument()
    expect(screen.queryByText('Published Post')).not.toBeInTheDocument()
  })
})

// ─── Suite 3: new post flow ───────────────────────────────────────────────────

describe('App – new post flow', () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it('adds a newly saved post to the list', async () => {
    render(<App />)

    userEvent.click(screen.getByText('+ New Post'))

    userEvent.type(screen.getByPlaceholderText('Post title'), 'Hello World')
    userEvent.type(screen.getByPlaceholderText('Author name'), 'Jane Doe')
    userEvent.type(screen.getByPlaceholderText('Write your post…'), 'The body of the post.')

    userEvent.click(screen.getByText('Save Post'))

    // After saving, App navigates back to the list view and the new card is rendered.
    expect(await screen.findByText('Hello World')).toBeInTheDocument()

    // The editor is gone — confirming the view switched back to the list.
    expect(screen.queryByPlaceholderText('Post title')).not.toBeInTheDocument()
  })
})

// ─── Suite 4: save validation ─────────────────────────────────────────────────

describe('App – save validation', () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it('displays validation errors when Save is clicked with title and body empty', async () => {
    render(<App />)

    // Open the editor without pre-filling any fields.
    userEvent.click(screen.getByText('+ New Post'))

    // Attempt to save with title and body left blank.
    userEvent.click(screen.getByText('Save Post'))

    // The error banner lists each validation message as a <li>.
    // Use findByText for the first error to wait for the synchronous
    // setErrors re-render, then getByText for the second.
    await screen.findByText('title is required')
    expect(screen.getByText('body is required')).toBeInTheDocument()

    // The editor should remain open — the view has not changed to the list.
    expect(screen.getByPlaceholderText('Post title')).toBeInTheDocument()
  })
})
