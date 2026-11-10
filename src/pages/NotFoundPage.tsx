import { Link } from 'react-router'

// Shown for any URL that doesn't match a route, e.g. /dashbord (typo).
function NotFoundPage() {
  return (
    <main className="page">
      <h1>Page not found</h1>
      <p>There's nothing at this address.</p>
      <Link to="/">Go to the home page</Link>
    </main>
  )
}

export default NotFoundPage
