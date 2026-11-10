// The shape of a project, written once so TypeScript can check every place
// that uses one. A "type" only exists while you write code: it's removed when
// the app is built, so it costs nothing in the browser.

// What the installer types into the form.
export type ProjectDetails = {
  customerName: string
  customerAddress: string
  mprn: string // 11 digits. A string, not a number, so leading zeros are kept.
  installerName: string
  modulesModel: string
  modulesQty: number
  inverter: string
  battery: string
}

// A full project: the details above, plus what the app adds.
// "&" means "everything in ProjectDetails, and also these fields".
export type Project = ProjectDetails & {
  id: string
  strings: number[] // modules per string, e.g. [21, 20]
}

// A blank form, used when starting a new project.
export const emptyProjectDetails: ProjectDetails = {
  customerName: '',
  customerAddress: '',
  mprn: '',
  installerName: '',
  modulesModel: '',
  modulesQty: 0,
  inverter: '',
  battery: '',
}
