import { useParams } from 'react-router'

// One project: the form and the drawing preview will live here.
//
// useParams() reads the parts of the URL that the route marked with ":".
// The route is "projects/:id", so on /projects/abc123 we get { id: 'abc123' }.
// TypeScript can't know the URL will always have an id, so its type is
// "string | undefined".
function ProjectPage() {
  const { id } = useParams()
  const isNew = id === 'new'

  return (
    <main className="page">
      <h1>{isNew ? 'New project' : `Project ${id}`}</h1>
      <p>The project form and the drawing preview will appear here.</p>
    </main>
  )
}

export default ProjectPage
