import type { ChangeEvent } from 'react'
import type { ProjectDetails } from '../types/project'

// The props this component expects. TypeScript will complain if the parent
// forgets one or passes the wrong kind of value.
type Props = {
  details: ProjectDetails
  onChange: (details: ProjectDetails) => void
}

// The project form. It doesn't keep its own state: the parent (ProjectPage)
// owns the details and passes them in, and every keystroke is sent back up
// through onChange. That way the page can also use the details for the
// string split now, and for the drawing preview later.
function ProjectForm({ details, onChange }: Props) {
  // One handler for every input. Each input has a "name" equal to a field in
  // ProjectDetails, so [name]: value updates the right field.
  // ChangeEvent<HTMLInputElement> is the type of the event an <input> sends.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    // The quantity is stored as a number; everything else stays as text.
    const newValue = name === 'modulesQty' ? Number(value) : value
    onChange({ ...details, [name]: newValue })
  }

  return (
    <form className="project-form">
      <fieldset>
        <legend>Customer</legend>

        <label>
          Customer name
          <input name="customerName" value={details.customerName} onChange={handleChange} />
        </label>

        <label>
          Address
          <input name="customerAddress" value={details.customerAddress} onChange={handleChange} />
        </label>

        <label>
          MPRN (11 digits)
          <input
            name="mprn"
            value={details.mprn}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={11}
          />
        </label>

        <label>
          Installer
          <input name="installerName" value={details.installerName} onChange={handleChange} />
        </label>
      </fieldset>

      <fieldset>
        <legend>System</legend>

        <label>
          PV module model
          <input name="modulesModel" value={details.modulesModel} onChange={handleChange} />
        </label>

        <label>
          Number of modules
          {/* Show an empty box instead of "0" so the field can be cleared. */}
          <input
            name="modulesQty"
            type="number"
            min={0}
            value={details.modulesQty === 0 ? '' : details.modulesQty}
            onChange={handleChange}
          />
        </label>

        <label>
          Inverter
          <input name="inverter" value={details.inverter} onChange={handleChange} />
        </label>

        <label>
          Battery (optional)
          <input name="battery" value={details.battery} onChange={handleChange} />
        </label>
      </fieldset>
    </form>
  )
}

export default ProjectForm
