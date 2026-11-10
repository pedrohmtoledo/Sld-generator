import { Link } from 'react-router'

// The installer's list of projects.
// There's no saving yet (that comes with Supabase), so the list is always
// empty for now. The "New project" button opens the project page with the
// id "new", which the project page treats as a blank project.
function DashboardPage() {
  return (
    <main className="page">
      <h1>Your projects</h1>
      <p>No projects yet.</p>

      <Link className="button" to="/projects/new">
        New project
      </Link>
    </main>
  )
}

export default DashboardPage
