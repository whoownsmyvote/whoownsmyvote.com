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
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Data sourced from FEC Schedule A filings · All information is public record
      </p>
      <p style={{ marginTop: 6 }}>
        whoownsmyvote.com · Built with public data for public accountability
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
