import { useState } from 'react'
import { useParams } from 'react-router'
import ProjectForm from '../components/ProjectForm'
import SldPreview from '../components/SldPreview'
import { emptyProjectDetails, type Project, type ProjectDetails } from '../types/project'
import { splitModules } from '../lib/strings'
import { generateSld } from '../drawing/generateSld'

// One project: the form, the string split and the drawing preview.
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

  // The full project: what was typed, plus the id from the URL and the
  // calculated strings. "id ?? 'new'" means: use id, or 'new' if it's missing.
  const project: Project = { ...details, id: id ?? 'new', strings }

  // Redrawn on every keystroke, so the preview always matches the form.
  const svg = generateSld(project)

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

      <section>
        <h2>Drawing</h2>
        <SldPreview svg={svg} />
      </section>
    </main>
  )
}

export default ProjectPage
