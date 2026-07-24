import { useState, useMemo } from 'react'

const fmtFull = (n) => `$${Math.round(n).toLocaleString()}`

const INITIAL_SHOW = 25
const LOAD_MORE = 50

export default function DonorTable({ donors, homeState }) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('amount')
  const [sortDir, setSortDir] = useState('desc')
  const [showCount, setShowCount] = useState(INITIAL_SHOW)
  const [stateFilter, setStateFilter] = useState('all')

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const states = useMemo(() => {
    const s = new Set(donors.map(d => d.state).filter(Boolean))
    return Array.from(s).sort()
  }, [donors])

  const filtered = useMemo(() => {
    let list = donors
    if (stateFilter === 'home') list = list.filter(d => d.state === homeState)
    else if (stateFilter === 'oos') list = list.filter(d => d.state !== homeState)
    else if (stateFilter !== 'all') list = list.filter(d => d.state === stateFilter)

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.employer || '').toLowerCase().includes(q) ||
        (d.occupation || '').toLowerCase().includes(q) ||
        (d.state || '').toLowerCase().includes(q)
      )
    }

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortField === 'amount') cmp = a.amount - b.amount
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortField === 'state') cmp = (a.state || '').localeCompare(b.state || '')
      else if (sortField === 'date') cmp = (a.date || '').localeCompare(b.date || '')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [donors, search, sortField, sortDir, stateFilter, homeState])

  const visible = filtered.slice(0, showCount)
  const totalFiltered = filtered.reduce((sum, d) => sum + d.amount, 0)

  const arrow = (field) => sortField === field ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''

  const headerStyle = (field, align) => ({
    fontSize: 11, fontWeight: 600, color: sortField === field ? 'var(--accent)' : 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 0.5, cursor: 'pointer', userSelect: 'none',
    padding: '8px 0', borderBottom: '1px solid var(--border-light)',
    textAlign: align || 'left',
  })

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>All Individual Donors</h2>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
        {donors.length} total donors · Search, filter, and sort the full list
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name, employer, occupation, state..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowCount(INITIAL_SHOW) }}
          style={{
            flex: 1, minWidth: 220, padding: '9px 12px', fontSize: 13,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <select
          value={stateFilter}
          onChange={e => { setStateFilter(e.target.value); setShowCount(INITIAL_SHOW) }}
          style={{
            padding: '9px 12px', fontSize: 12, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text-secondary)', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <option value="all">All states</option>
          <option value="home">{homeState} only (home state)</option>
          <option value="oos">Out-of-state only</option>
          <optgroup label="Individual states">
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
        </select>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        Showing {Math.min(showCount, filtered.length)} of {filtered.length} donors · Total: {fmtFull(totalFiltered)}
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.8fr 0.6fr 0.8fr', gap: 8, alignItems: 'center' }}>
        <div style={headerStyle('name')} onClick={() => toggleSort('name')}>Name{arrow('name')}</div>
        <div style={headerStyle('')}>Employer / Occupation</div>
        <div style={headerStyle('amount', 'center')} onClick={() => toggleSort('amount')}>Amount{arrow('amount')}</div>
        <div style={headerStyle('state', 'center')} onClick={() => toggleSort('state')}>State{arrow('state')}</div>
        <div style={headerStyle('date')} onClick={() => toggleSort('date')}>Date{arrow('date')}</div>
      </div>

      {/* Rows */}
      {visible.map((d, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.8fr 0.6fr 0.8fr', gap: 8,
          alignItems: 'center', padding: '7px 0',
          borderBottom: '1px solid #161616', fontSize: 12,
        }}>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.name}</div>
          <div style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[d.employer, d.occupation].filter(Boolean).join(' / ')}
          </div>
          <div style={{
            textAlign: 'center', fontWeight: 600,
            color: d.amount >= 3500 ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            {fmtFull(d.amount)}
          </div>
          <div style={{ textAlign: 'center', color: d.state === homeState ? 'var(--accent)' : 'var(--text-muted)' }}>{d.state}</div>
          <div style={{ color: 'var(--text-dim)' }}>{d.date}</div>
        </div>
      ))}

      {/* Load more */}
      {showCount < filtered.length && (
        <button
          onClick={() => setShowCount(c => c + LOAD_MORE)}
          style={{
            display: 'block', width: '100%', padding: '12px', marginTop: 12,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--accent)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Load {Math.min(LOAD_MORE, filtered.length - showCount)} more donors ({filtered.length - showCount} remaining)
        </button>
      )}
    </div>
  )
}
