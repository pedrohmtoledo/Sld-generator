import { Link, NavLink, Outlet } from 'react-router'

// The frame shared by every page: a header with links, then the page itself.
//
// <Outlet /> is where React Router puts the page that matches the URL.
// <NavLink> is a <Link> that knows when its page is open: React Router adds
// the "active" class to it, which index.css uses to underline it.
function Layout() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="logo">
          SLD Generator
        </Link>
        <nav>
          {/* "end" means: only active on exactly "/", not on every page under it. */}
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>

      <Outlet />
    </>
  )
}

export default Layout
