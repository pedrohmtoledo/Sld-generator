// Reads one of Pedro's block SVGs and works out what the code needs to place it:
// - where its insertion point is (the blue cross)
// - where each connection point is (the red circles) and what it's called
// - the drawing itself, with the red/blue markers and their labels removed
//
// The browser does the measuring: we put the SVG on the page (invisible) and ask
// it where each shape ended up. That's more reliable than doing the maths
// ourselves, because the AutoCAD → PDF → Inkscape export adds transforms.

// A point in millimetres.
export type Point = { x: number; y: number }

export type Block = {
  // The block's drawing (SVG markup), markers removed, in the file's own units (px).
  content: string
  // The insertion point in the file's units (px). Blocks without a blue cross
  // (the sheet frame) use the top-left corner, 0,0.
  insertion: Point
  // Connection points, in mm, measured from the insertion point.
  // e.g. points.DC1 = { x: 0, y: -23.5 } means 23.5 mm above the insertion point.
  points: Record<string, Point>
  // Size of the whole file, in mm.
  width: number
  height: number
}

// The colours Pedro uses for markers (see CLAUDE.md).
const CONNECTION_RED = '#ed1f24'
const INSERTION_BLUE = '#0000ff'

// SVG files from Inkscape are in px, at 96 px per inch. 1 inch = 25.4 mm.
export const PX_TO_MM = 25.4 / 96

// Which stroke colour does a shape use? Inkscape writes it inside "style".
function strokeColour(element: Element): string {
  const style = element.getAttribute('style') ?? ''
  const match = style.match(/stroke:\s*(#[0-9a-fA-F]{6})/)
  return match ? match[1].toLowerCase() : ''
}

// The centre of a shape, in the coordinates of the whole SVG file.
// getBBox() gives the box in the shape's own coordinates; the matrix converts
// from there to the file's coordinates (undoing every transform on the way).
function centreOf(element: SVGGraphicsElement, root: SVGSVGElement): Point {
  const box = element.getBBox()
  const toRoot = root.getScreenCTM()!.inverse().multiply(element.getScreenCTM()!)
  const centre = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2)
  const p = centre.matrixTransform(toRoot)
  return { x: p.x, y: p.y }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// How placeholder text ({{...}}) lines up once it's filled in.
// AutoCAD's text alignment is lost in the PDF export: each text only keeps its
// start point. So the code puts the alignment back:
// - 'centre': the filled-in text is centred where the placeholder was centred
//   (used for blocks, e.g. the module name above the PV string)
// - 'start': the filled-in text starts where the placeholder started
//   (used for the title block, where text lines up on the left)
export type PlaceholderAlign = 'centre' | 'start'

export function loadBlock(svgText: string, align: PlaceholderAlign = 'centre'): Block {
  // 1. Turn the text into a real SVG element and put it on the page, invisible.
  //    (The browser only measures shapes that are on the page.)
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const root = document.importNode(doc.documentElement, true) as unknown as SVGSVGElement
  const holder = document.createElement('div')
  holder.style.cssText = 'position:absolute; left:-100000px; top:0; visibility:hidden'
  holder.appendChild(root)
  document.body.appendChild(holder)

  try {
    const shapes = Array.from(root.querySelectorAll('path')) as SVGGraphicsElement[]
    const texts = Array.from(root.querySelectorAll('text')) as SVGGraphicsElement[]

    const red = shapes.filter((s) => strokeColour(s) === CONNECTION_RED)
    const blue = shapes.filter((s) => strokeColour(s) === INSERTION_BLUE)

    // 2. Insertion point: the middle of the blue cross (its two lines share a centre).
    let insertion: Point = { x: 0, y: 0 }
    if (blue.length > 0) {
      const centres = blue.map((s) => centreOf(s, root))
      insertion = {
        x: centres.reduce((sum, c) => sum + c.x, 0) / centres.length,
        y: centres.reduce((sum, c) => sum + c.y, 0) / centres.length,
      }
    }

    // 3. Connection points: each red circle takes the nearest word as its name.
    //    The name labels are removed from the drawing afterwards.
    const textCentres = texts.map((t) => ({ element: t, centre: centreOf(t, root), used: false }))
    const points: Record<string, Point> = {}
    const toRemove: Element[] = [...red, ...blue]

    for (const circle of red) {
      const c = centreOf(circle, root)
      const candidates = textCentres.filter((t) => !t.used)
      if (candidates.length === 0) break
      const nearest = candidates.reduce((best, t) =>
        distance(t.centre, c) < distance(best.centre, c) ? t : best,
      )
      nearest.used = true
      toRemove.push(nearest.element)
      const name = (nearest.element.textContent ?? '').trim()
      // Store it in mm, measured from the insertion point.
      points[name] = { x: (c.x - insertion.x) * PX_TO_MM, y: (c.y - insertion.y) * PX_TO_MM }
    }

    // The "0,0" label next to the blue cross is removed too.
    if (blue.length > 0) {
      const remaining = textCentres.filter((t) => !t.used)
      if (remaining.length > 0) {
        const nearest = remaining.reduce((best, t) =>
          distance(t.centre, insertion) < distance(best.centre, insertion) ? t : best,
        )
        if ((nearest.element.textContent ?? '').trim() === '0,0') toRemove.push(nearest.element)
      }
    }

    // 4. Centre the placeholders (see PlaceholderAlign above).
    //    getBBox() gives the placeholder's box in its own coordinates; we move the
    //    text's anchor to the middle of that box and tell SVG to centre on it.
    if (align === 'centre') {
      for (const text of texts) {
        if (!(text.textContent ?? '').includes('{{')) continue
        const box = text.getBBox()
        const middle = box.x + box.width / 2
        for (const tspan of Array.from(text.querySelectorAll('tspan'))) {
          tspan.setAttribute('x', String(middle))
          tspan.setAttribute('text-anchor', 'middle')
        }
      }
    }

    // 5. Remove the markers, then take what's left as the block's drawing.
    for (const element of toRemove) element.remove()

    // Inkscape adds its own settings (e.g. <sodipodi:namedview>, inkscape:label="...").
    // They aren't part of the drawing, so they're removed too.
    for (const element of Array.from(root.querySelectorAll('*'))) {
      if (element.namespaceURI !== 'http://www.w3.org/2000/svg') {
        element.remove()
        continue
      }
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.includes(':')) element.removeAttribute(attribute.name)
      }
    }

    const viewBox = root.viewBox.baseVal

    // Print everything in black and in Arial, whatever colour or font it was drawn in.
    const content = root.innerHTML
      .replace(/stroke:#[0-9a-fA-F]{6}/g, 'stroke:#000000')
      .replace(/font-family:[^;"]*/g, 'font-family:Arial')

    return {
      content,
      insertion,
      points,
      width: viewBox.width * PX_TO_MM,
      height: viewBox.height * PX_TO_MM,
    }
  } finally {
    // Always take the invisible SVG off the page again.
    holder.remove()
  }
}
