import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App() {
  const loc = useLocation()
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Elice Learning Platform</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/" style={{ fontWeight: loc.pathname === '/' ? 'bold' : 'normal' }}>Videos</Link>
          <Link to="/saved" style={{ fontWeight: loc.pathname === '/saved' ? 'bold' : 'normal' }}>Saved</Link>
        </nav>
      </header>
      <main style={{ marginTop: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}


