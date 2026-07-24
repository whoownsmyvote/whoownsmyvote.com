import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const fmt = (n) => {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export default function Home() {
  const [politicians, setPoliticians] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('aipacTotal')

  useEffect(() => {
    fetch('/data/index.json')
      .then(r => r.json())
      .then(setPoliticians)
      .catch(() => {})
  }, [])

  const filtered = politicians
    .filter(p => {
      const q = search.toLowerCase()
      if (!q) return true
      return p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'aipacTotal') return b.aipacTotal - a.aipacTotal
      if (sortBy === 'outOfState') return b.outOfStatePercent - a.outOfStatePercent
      if (sortBy === 'totalRaised') return b.totalRaised - a.totalRaised
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="wrap">
      {/* Hero */}
      <div style={{ marginBottom: 40, paddingTop: 20 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
          Who <span style={{ color: 'var(--accent)' }}>owns</span> your representative?
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          Follow the money behind every elected official. See where donations come from,
          who bundles them, and how much actually comes from constituents — all from public FEC filings.
        </p>
      </div>

      {/* Search and sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, state, or district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 240, padding: '10px 14px', fontSize: 14,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px', fontSize: 13, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-secondary)', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <option value="aipacTotal">Sort: Pro-Israel Lobby $ (high → low)</option>
          <option value="outOfState">Sort: Out-of-state % (high → low)</option>
          <option value="totalRaised">Sort: Total raised (high → low)</option>
          <option value="name">Sort: Name (A → Z)</option>
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
        {filtered.length} politician{filtered.length !== 1 ? 's' : ''} in database
      </div>

      {/* Politician cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(p => (
          <Link to={`/politician/${p.slug}`} key={p.slug} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', borderRadius: 10, padding: '18px 20px',
              border: '1px solid var(--border)', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Top row: name + district */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-dim)', marginLeft: 10 }}>
                    {p.district} · {p.party === 'D' ? 'Democrat' : p.party === 'R' ? 'Republican' : p.party}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.dateRange}</span>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Total Raised</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(p.totalRaised)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Home State %</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                    {p.homeStatePercent}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Out-of-State %</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{p.outOfStatePercent}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--warn)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Pro-Israel Lobby</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--warn)' }}>{fmt(p.aipacTotal)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>PAC Money</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(p.pacMoney)}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          No politicians match your search.
        </div>
      )}
    </div>
  )
}
