// Makes user text safe to put inside the SVG, in the drawing's style.
//
// The SVG is XML, where "&", "<" and ">" have special meanings. If a customer
// were called "Murphy & Sons", the raw "&" would break the whole drawing,
// so each one is replaced by its XML code ("&amp;" and so on).
// "&" must be replaced first, or the "&" inside "&lt;" would be replaced again.
//
// Text is also uppercased, like the lettering on an AutoCAD drawing.
export function escapeText(text: string): string {
  return text
    .toUpperCase()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
