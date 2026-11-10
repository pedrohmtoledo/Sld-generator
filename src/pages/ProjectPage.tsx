import { useState } from 'react'
import { useParams } from 'react-router'
import ProjectForm from '../components/ProjectForm'
import { emptyProjectDetails, type ProjectDetails } from '../types/project'
import { splitModules } from '../lib/strings'

// One project: the form, and below it the string split.
// The drawing preview will be added here in the next PR.
//
// useParams() reads the ":id" part of the URL (see App.tsx).
// Projects aren't saved yet (that comes with Supabase), so every project
// page starts with a blank form.
function ProjectPage() {
  const { id } = useParams()
  const isNew = id === 'new'

  // useState<ProjectDetails> tells TypeScript what this state holds, so
  // details.modulesQty is known to be a number, details.mprn a string, etc.
  const [details, setDetails] = useState<ProjectDetails>(emptyProjectDetails)

  // Not stored in state: it's recalculated from details on every render,
  // so it can never get out of sync with the number of modules.
  const strings = splitModules(details.modulesQty)

  return (
    <main className="page">
      <h1>{isNew ? 'New project' : `Project ${id}`}</h1>

      <ProjectForm details={details} onChange={setDetails} />

      <section className="strings">
        <h2>Strings</h2>
        <ul>
          {strings.map((modules, index) => (
            <li key={index}>
              String {index + 1}: {modules} modules
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default ProjectPage
