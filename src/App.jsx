import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">
          WHO OWNS <span>MY VOTE</span>
        </Link>
        <nav className="site-nav">
          <Link to="/">All Politicians</Link>
          <a href="https://www.fec.gov" target="_blank" rel="noopener">FEC Source</a>
          <a href="https://buymeacoffee.com/whoownsmyvote" target="_blank" rel="noopener" style={{ color: '#2dd4a8' }}>☕ Support</a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <p style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
        Built by a concerned citizen who believes we all deserve to know the truth.
      </p>
      <p style={{ fontSize: 12, marginBottom: 10 }}>
        <a href="https://buymeacoffee.com/whoownsmyvote" target="_blank" rel="noopener"
          style={{ color: '#2dd4a8', textDecoration: 'underline' }}>
          If this is useful to you, consider buying me a coffee.
        </a>
      </p>
      <p>
        Data sourced from FEC Schedule A filings · All information is public record
      </p>
      <p style={{ marginTop: 6 }}>
        whoownsmyvote.com
      </p>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/politician/:slug" element={<Dashboard />} />
      </Routes>
      <Footer />
    </>
  )
}
