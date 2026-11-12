// STAGE 2 TEST: builds the drawing from Pedro's blocks instead of the stage 1 template.
//
// For now it only uses three blocks (sheet frame, PV string, inverter), so it
// shows that automatic assembly works. DC isolators, the AC side, the table
// and the block diagram come in later PRs.
//
// Everything on the sheet is in millimetres: the sheet is A2 landscape, 594 × 420 mm,
// with 0,0 at the top-left corner and y going down (that's how SVG works).

import type { Project } from '../../types/project'
import { escapeText } from '../escapeText'
import { loadBlock, PX_TO_MM, type Block, type Point } from './loadBlock'

import frameSvg from '../blocks/sheet-frame.svg?raw'
import pvStringSvg from '../blocks/pv-string.svg?raw'
import inverterSvg from '../blocks/inverter.svg?raw'

const SHEET_WIDTH = 594
const SHEET_HEIGHT = 420
const LINE_WIDTH = 0.25 // mm, about the same as the lines in Pedro's blocks

// Measuring the blocks takes a moment, so it's done once and remembered.
// ("let ... | null" means: starts empty, filled the first time it's needed.)
let blocks: { frame: Block; pvString: Block; inverter: Block } | null = null

function getBlocks() {
  if (blocks === null) {
    blocks = {
      frame: loadBlock(frameSvg),
      pvString: loadBlock(pvStringSvg),
      inverter: loadBlock(inverterSvg),
    }
  }
  return blocks
}

// Fills the {{...}} placeholders in a block's drawing.
// "Record<string, string>" means: an object whose keys and values are all text.
function fill(content: string, values: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

// Puts a block on the sheet with its insertion point at "at" (mm).
// Returns the SVG for it and where its connection points ended up on the sheet.
function place(block: Block, at: Point, values: Record<string, string> = {}) {
  // Read the transform right to left:
  // 1. move the block so its insertion point is at 0,0
  // 2. scale it from px to mm
  // 3. move it to "at" on the sheet
  const transform =
    `translate(${at.x} ${at.y}) scale(${PX_TO_MM}) ` +
    `translate(${-block.insertion.x} ${-block.insertion.y})`

  const points: Record<string, Point> = {}
  for (const [name, p] of Object.entries(block.points)) {
    points[name] = { x: at.x + p.x, y: at.y + p.y }
  }

  return { svg: `<g transform="${transform}">${fill(block.content, values)}</g>`, points }
}

// A wire: straight lines through the given points.
function wire(points: Point[]): string {
  const coordinates = points.map((p) => `${p.x},${p.y}`).join(' ')
  return `<polyline points="${coordinates}" fill="none" stroke="#000000" stroke-width="${LINE_WIDTH}" />`
}

export function assembleSld(project: Project, date: Date = new Date()): string {
  const { frame, pvString, inverter } = getBlocks()
  const parts: string[] = []

  // 1. The frame, centred on the A2 sheet, with the title block filled in.
  const frameAt = { x: (SHEET_WIDTH - frame.width) / 2, y: (SHEET_HEIGHT - frame.height) / 2 }
  parts.push(
    place(frame, frameAt, {
      CUSTOMER_NAME: escapeText(project.customerName),
      CUSTOMER_ADDRESS: escapeText(project.customerAddress),
      INSTALLER_NAME: escapeText(project.installerName),
      DATE: date.toLocaleDateString('en-IE'),
    }).svg,
  )

  // 2. The inverter, in the main drawing area (about 483 × 304 mm, top left of the frame).
  const inv = place(inverter, { x: frameAt.x + 240, y: frameAt.y + 170 }, {
    MODEL: escapeText(project.inverter),
  })
  parts.push(inv.svg)

  // 3. One PV string per string, stacked on the left, each wired to its inverter input.
  const inputs = ['DC1', 'DC2']
  project.strings.forEach((modules, index) => {
    const string = place(pvString, { x: frameAt.x + 80, y: frameAt.y + 120 + index * 70 }, {
      PV_MODEL: escapeText(project.modulesModel),
      PV_QTY: `${modules} MODULES`,
    })
    parts.push(string.svg)

    const from = string.points.OUT
    const to = inv.points[inputs[index]]
    if (from && to) {
      // Right, then up or down, then right into the inverter.
      const bendX = to.x - 25
      parts.push(wire([from, { x: bendX, y: from.y }, { x: bendX, y: to.y }, to]))
    }
  })

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_WIDTH}mm" height="${SHEET_HEIGHT}mm" ` +
    `viewBox="0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}">` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#ffffff" />` +
    parts.join('') +
    `</svg>`
  )
}
