import type { Project } from '../types/project'
import { escapeText } from './escapeText'

// "?raw" is a Vite feature: it imports the file's contents as one long string
// instead of as an image URL, so we can search and replace inside it.
import template from './templates/sld-1-inv-2-string-v01.svg?raw'

// THE drawing function: project data in, SVG text out.
// The preview (and later the PDF export) only ever call this, so stage 2
// (automatic assembly) can replace what's inside without touching them.
//
// Stage 1: fill the placeholders in Pedro's template, e.g. {{INVERTER}}.
//
// "date" has a default value (today). Passing a fixed date makes the output
// predictable, which the tests will need.
export function generateSld(project: Project, date: Date = new Date()): string {
  // The template always draws a battery. Until stage 2 can leave it out,
  // a project without one is labelled "NO BATTERY".
  const battery = project.battery.trim() === '' ? 'NO BATTERY' : project.battery

  return template
    .replaceAll('{{INVERTER}}', escapeText(project.inverter))
    .replaceAll('{{BATTERY}}', escapeText(battery))
    .replaceAll('{{STRING_1}}', String(project.strings[0]))
    .replaceAll('{{STRING_2}}', String(project.strings[1]))
    .replaceAll('{{PV_MODULES}}', escapeText(project.modulesModel))
    .replaceAll('{{MODULES_QTY}}', String(project.modulesQty))
    .replaceAll('{{CUSTOMER_NAME}}', escapeText(project.customerName))
    .replaceAll('{{CUSTOMER_ADDRESS}}', escapeText(project.customerAddress))
    .replaceAll('{{MPRN}}', 'MPRN:' + escapeText(project.mprn))
    .replaceAll('{{INSTALLER_NAME}}', escapeText(project.installerName))
    // 'en-IE' gives the Irish date format, DD/MM/YYYY.
    .replaceAll('{{DATE}}', date.toLocaleDateString('en-IE'))
}
