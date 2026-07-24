import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import DonorTable from '../components/DonorTable'

const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}k` : `$${n}`
const fmtFull = (n) => `$${Math.round(n).toLocaleString()}`

function StatCard({ label, value, sub, sub2, accent, warn }) {
  const cls = `card${accent ? ' accent' : ''}${warn ? ' warn' : ''}`
  return (
    <div className={cls}>
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
      {sub2 && <div className="card-sub">{sub2}</div>}
    </div>
  )
}

function StateChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#222', border: '1px solid #444', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
      <div style={{ color: '#ccc', fontWeight: 600 }}>{d.state} — {d.pctOfTotal}% of total</div>
      <div style={{ color: '#f0f0f0' }}>{fmtFull(payload[0].value)}</div>
      {d.count != null && <div style={{ color: '#888', fontSize: 11 }}>{d.count} contributions</div>}
    </div>
  )
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#222', border: '1px solid #444', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
      <div style={{ color: '#ccc', fontWeight: 600 }}>{d.name || d.bracket}</div>
      <div style={{ color: '#f0f0f0' }}>{fmtFull(payload[0].value)}</div>
      {d.count != null && <div style={{ color: '#888', fontSize: 11 }}>{d.count} contributions</div>}
    </div>
  )
}

function NotableDonorGroup({ group }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? group.donors : group.donors.slice(0, 4)
  const hasMore = group.donors.length > 4

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: group.color, textTransform: 'uppercase',
        letterSpacing: 0.8, marginBottom: 8, paddingBottom: 6,
        borderBottom: `1px solid ${group.color}33`,
      }}>
        {group.category}
      </div>
      {visible
        .sort((a, b) => b.amount - a.amount)
        .map((d, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '6px 0', borderBottom: '1px solid #1a1a1a',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</span>
            <span style={{ color: '#666', fontSize: 12, marginLeft: 6 }}>{d.detail}</span>
            {d.state && <span style={{ color: '#555', fontSize: 11, marginLeft: 6 }}>({d.state})</span>}
            {d.note && <div style={{ fontSize: 11, color: '#888', marginTop: 2, fontStyle: 'italic' }}>{d.note}</div>}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 10 }}>
            {fmtFull(d.amount)}{d.maxed ? ' ✦' : ''}
          </div>
        </div>
      ))}
      {hasMore && !expanded && (
        <button onClick={() => setExpanded(true)} style={{
          background: 'none', border: 'none', color: group.color, fontSize: 12,
          cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit', fontWeight: 600,
        }}>
          Show all {group.donors.length} donors →
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/data/${slug}.json`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="wrap" style={{ paddingTop: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  if (!data) return <div className="wrap" style={{ paddingTop: 60, textAlign: 'center' }}><p>Politician not found.</p><Link to="/" style={{ color: 'var(--accent)' }}>← Back to all politicians</Link></div>

  const s = data.summary

  const stateDataWithPct = data.stateBreakdown.map(item => ({
    ...item,
    pctOfTotal: (item.amount / s.individualTotal * 100).toFixed(1),
  }))

  return (
    <div className="wrap">
      <Link to="/" style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 12 }}>← All politicians</Link>
      <div className="eyebrow">FEC Schedule A Analysis</div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
        {data.name} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: 15 }}>({data.district})</span>
      </h1>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>
        {data.dateRange} · {data.committee}
      </div>

      {/* Stat row 1 */}
      <div className="cards">
        <StatCard label="Total raised (net)" value={fmt(s.totalRaised)} sub={`${s.totalTransactions} transactions`} />
        <StatCard label="In-state constituent $" value={fmtFull(s.homeStateTotal)} sub={`${s.homeStatePercent}% of individual donations`} accent />
        <StatCard label="Out-of-state individual $" value={fmtFull(s.outOfStateTotal)} sub={`${s.outOfStatePercent}% of individual donations`} />
        <StatCard label="Pro-Israel lobby" value={fmtFull(s.aipacTotal)} sub={`${s.aipacTransactions} earmarked contributions`} warn />
      </div>
      {/* Stat row 2 */}
      <div className="cards mb">
        <StatCard
          label="PAC / committee"
          value={fmtFull(s.pacMoney)}
          sub={`${s.pacPercent}% of all receipts`}
          sub2={s.uniquePacs ? `${s.uniquePacs} unique PACs` : ''}
        />
        {s.candidateSelfFunding > 0 && (
          <StatCard label="Candidate self-funding" value={fmtFull(s.candidateSelfFunding)} sub={s.selfFundingNote} />
        )}
        <StatCard
          label="Individual donations"
          value={fmtFull(s.individualTotal)}
          sub={`${s.individualPercent || Math.round(s.individualTotal / s.totalRaised * 100)}% of all receipts`}
          sub2={s.uniqueDonors ? `${s.uniqueDonors.toLocaleString()} unique donors` : ''}
        />
        <StatCard
          label="Avg individual donation"
          value={`$${s.avgDonation.toLocaleString()}`}
          sub={`${s.maxedDonations} maxed at $3,500`}
          sub2={s.maxedOosPercent ? `${s.maxedOosPercent}% of maxed donors from out-of-state` : ''}
        />
        {s.aipacPercent >= 5 && (
          <StatCard
            label="Pro-Israel lobby as % of indiv. $"
            value={`${s.aipacPercent}%`}
            sub={s.aipacBundled > 0 ? `$${(s.aipacBundled/1000).toFixed(0)}K bundled through Pro-Israel lobby` : ''}
            warn
          />
        )}
      </div>

      {/* STATE GEOGRAPHY CHART */}
      <div className="divider" />
      <h2>Individual Donations by State</h2>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', borderRadius: 2, marginRight: 4 }}></span>{data.stateFull} (home state)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--blue)', borderRadius: 2, marginRight: 4 }}></span>Out-of-state</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stateDataWithPct} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis dataKey="state" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: '#333' }} tickLine={false} />
          <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
          <Tooltip content={<StateChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
            {stateDataWithPct.map((e, i) => (
              <Cell key={i} fill={e.isHome ? '#e8612d' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="insight">
        <h3 className="accent">Key takeaway</h3>
        <p>{data.insights.geography}</p>
      </div>

      {/* TOP PACS CHART */}
      <div className="divider" />
      <h2>Top PAC / Committee Donors</h2>
      {s.aipacBundled > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
          Pro-Israel lobby total includes ${(s.aipacBundled/1000).toFixed(0)}K in bundled earmarked contributions + direct PAC + DMFI PAC
        </div>
      )}
      <ResponsiveContainer width="100%" height={Math.max(data.topPacs.length * 40, 300)}>
        <BarChart data={data.topPacs} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="name" width={200} tick={{ fill: '#aaa', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="amount" radius={[0, 3, 3, 0]}>
            {data.topPacs.map((e, i) => (
              <Cell key={i} fill={e.type === 'aipac' ? '#e8c12d' : e.type === 'conduit' ? '#555' : '#2dd4a8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="insight">
        <h3 className="warn">Pro-Israel lobby total: {fmtFull(s.israelAlignedTotal)}</h3>
        <p>{data.insights.pacs}</p>
      </div>

      {/* DONATION SIZE */}
      <div className="divider" />
      <h2>Individual Donation Size Distribution</h2>
      <div style={{ marginTop: 14 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.donationSizeDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="bracket" tick={{ fill: '#888', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} />
            <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="big-stats">
        <div className="big-stat"><div className="num">{s.pctFromOver1000}%</div><div className="desc">of individual $ came from donations of $1,000+</div></div>
        <div className="big-stat"><div className="num">{s.pctFromUnder100}%</div><div className="desc">of individual $ came from donations under $100</div></div>
        <div className="big-stat">
          <div className="num">{s.maxedDonations}</div>
          <div className="desc">
            donations hit the $3,500 federal maximum
            {s.maxedOosPercent ? ` · ${s.maxedOosPercent}% from out-of-state` : ''}
          </div>
        </div>
      </div>
      <div className="insight">
        <h3 className="accent">Grassroots check</h3>
        <p>{data.insights.donationSize}</p>
      </div>

      {/* NOTABLE DONORS */}
      <div className="divider" />
      <h2 style={{ marginBottom: 16 }}>Notable Individual Donors</h2>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>✦ = maxed out at federal limit</div>
      {data.notableDonors.map((group, i) => (
        <NotableDonorGroup key={i} group={group} />
      ))}
      {data.insights.notable && (
        <div className="insight">
          <h3 className="warn">Donor network patterns</h3>
          <p>{data.insights.notable}</p>
        </div>
      )}

      {/* ALL DONORS TABLE */}
      <div className="divider" />
      <DonorTable donors={data.allDonors} homeState={data.state} />

      {/* Source */}
      <div style={{ marginTop: 40, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-ghost)' }}>
        Source: FEC Schedule A filings · {data.committee}{data.committeeId ? ` · ${data.committeeId}` : ''} · Data: {data.dateRange}
      </div>
    </div>
  )
}
