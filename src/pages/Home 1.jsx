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
  const [chamberFilter, setChamberFilter] = useState('all')

  useEffect(() => {
    fetch('/data/index.json')
      .then(r => r.json())
      .then(setPoliticians)
      .catch(() => {})
  }, [])

  const filtered = politicians
    .filter(p => {
      if (chamberFilter === 'house' && p.chamber !== 'House') return false
      if (chamberFilter === 'senate' && p.chamber !== 'Senate') return false
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
      if (sortBy === 'avgDonation') return (b.avgDonation || 0) - (a.avgDonation || 0)
      if (sortBy === 'maxedOos') return (b.maxedOosPercent || 0) - (a.maxedOosPercent || 0)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  const houseCount = politicians.filter(p => p.chamber === 'House').length
  const senateCount = politicians.filter(p => p.chamber === 'Senate').length

  return (
    <div className="wrap">
      {/* Hero */}
      <div style={{ marginBottom: 32, paddingTop: 20 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
          Who <span style={{ color: 'var(--accent)' }}>owns</span> your representative?
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 620, lineHeight: 1.6 }}>
          Follow the money behind every elected official. See where donations come from,
          how much actually comes from constituents, and who owns your representative —
          all data sourced from public FEC filings.
        </p>
      </div>

      {/* Civic engagement CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2a1a 0%, #1a1a1a 100%)',
        border: '1px solid #2a3a2a',
        borderRadius: 10,
        padding: '18px 22px',
        marginBottom: 28,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Information is good. Civic engagement is better.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Call the U.S. Capitol Switchboard and ask to be connected to your representative.
            Let them know you're watching who funds their campaigns.
          </div>
        </div>
        <a
          href="tel:+12022243121"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          (202) 224-3121
        </a>
      </div>

      {/* Search, filter, sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, state, or district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px', fontSize: 14,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <select
          value={chamberFilter}
          onChange={e => setChamberFilter(e.target.value)}
          style={{
            padding: '10px 14px', fontSize: 13, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-secondary)', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <option value="all">All ({politicians.length})</option>
          <option value="house">House ({houseCount})</option>
          <option value="senate">Senate ({senateCount})</option>
        </select>
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
          <option value="maxedOos">Sort: Maxed donors out-of-state % (high → low)</option>
          <option value="avgDonation">Sort: Avg donation (high → low)</option>
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
              onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Top row: name + district */}
              <div className="card-header">
                <div>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-dim)', marginLeft: 10 }}>
                    {p.district} · {p.party === 'D' ? 'Democrat' : p.party === 'R' ? 'Republican' : p.party} · {p.chamber}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.dateRange}</span>
              </div>

              {/* Stats grid - responsive */}
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Raised</div>
                  <div className="stat-value">{fmt(p.totalRaised)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label" style={{ color: 'var(--text-dim)' }}>In-State %</div>
                  <div className="stat-value" style={{ color: 'var(--accent)' }}>{p.homeStatePercent}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Out-of-State %</div>
                  <div className="stat-value">{p.outOfStatePercent}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label" style={{ color: 'var(--warn)' }}>Pro-Israel Lobby</div>
                  <div className="stat-value" style={{ color: 'var(--warn)' }}>{fmt(p.aipacTotal)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg Donation</div>
                  <div className="stat-value">${(p.avgDonation || 0).toLocaleString()}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Maxed from OOS</div>
                  <div className="stat-value">{p.maxedOosPercent || '—'}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">PAC %</div>
                  <div className="stat-value">{p.pacPercent || '—'}%</div>
                </div>
              </div>

              {/* Click prompt */}
              <div style={{
                marginTop: 12, paddingTop: 10, borderTop: '1px solid #222',
                fontSize: 12, color: 'var(--accent)', fontWeight: 600,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>View full breakdown →</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 400 }}>
                  Donors · PACs · Charts · Notable interests
                </span>
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

      {/* Inline styles for responsive layout */}
      <style>{`
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 6px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 12px 20px;
        }
        .stat-item {}
        .stat-label {
          font-size: 11px;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 700;
        }
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px 16px;
          }
          .stat-value {
            font-size: 16px;
          }
          .card-header {
            flex-direction: column;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  )
}
