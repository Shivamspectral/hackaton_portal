'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ProblemStatementCard } from '@/components/features/problem-statement-card'
import { StaggerGroup, StaggerItem } from '@/components/site/reveal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { categories } from '@/lib/mock-data'
import type { Category, ProblemStatement, PSStatus } from '@/lib/types'

const STATUSES: (PSStatus | 'All')[] = ['All', 'Open', 'Filling Fast', 'Closed']

type SortKey = 'default' | 'title-asc' | 'teams-desc' | 'teams-asc'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Sort: Featured' },
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'teams-desc', label: 'Most teams selected' },
  { value: 'teams-asc', label: 'Fewest teams selected' },
]

export function PSExplorer({ problems }: { problems: ProblemStatement[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [status, setStatus] = useState<PSStatus | 'All'>('All')
  const [sort, setSort] = useState<SortKey>('default')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = problems.filter((ps) => {
      const matchesQuery =
        !q ||
        ps.title.toLowerCase().includes(q) ||
        ps.psId.toLowerCase().includes(q) ||
        ps.organization.toLowerCase().includes(q) ||
        ps.shortDescription.toLowerCase().includes(q) ||
        ps.tags.some((t) => t.toLowerCase().includes(q))
      const matchesCategory = category === 'All' || ps.category === category
      const matchesStatus = status === 'All' || ps.status === status
      return matchesQuery && matchesCategory && matchesStatus
    })

    list = [...list]
    switch (sort) {
      case 'title-asc':
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'teams-desc':
        list.sort((a, b) => b.teamsSelected - a.teamsSelected)
        break
      case 'teams-asc':
        list.sort((a, b) => a.teamsSelected - b.teamsSelected)
        break
    }
    return list
  }, [problems, query, category, status, sort])

  const activeFilters = category !== 'All' || status !== 'All' || query.trim()

  function reset() {
    setQuery('')
    setCategory('All')
    setStatus('All')
    setSort('default')
  }

  return (
    <div>
      {/* Controls */}
      <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, PS ID, organization, or tag…"
              className="pl-10"
              aria-label="Search problem statements"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | 'All')}
              aria-label="Filter by category"
              className="lg:w-44"
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as PSStatus | 'All')}
              aria-label="Filter by status"
              className="lg:w-40"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All statuses' : s}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort problem statements"
              className="lg:w-52"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Result meta */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          {filtered.length} of {problems.length} problem statements
        </p>
        {activeFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <StaggerGroup
          key={`${category}-${status}-${sort}-${query}`}
          className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((ps) => (
            <StaggerItem key={ps.id} className="h-full">
              <ProblemStatementCard ps={ps} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
          <p className="font-display text-lg font-semibold">No matches found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different search term or clear the filters to see every
            challenge across all nine tracks.
          </p>
          <Button variant="outline" className="mt-5" onClick={reset}>
            Reset explorer
          </Button>
        </div>
      )}
    </div>
  )
}
