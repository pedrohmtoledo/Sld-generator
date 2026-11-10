// Shows an SVG drawing on the page.
//
// The SVG text is turned into a "data URL" (the whole file packed into the
// address) and shown with a normal <img>. An <img> never runs scripts that
// might be hidden in the SVG, so this is also the safe way to display it.
type Props = {
  svg: string
}

function SldPreview({ svg }: Props) {
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

  return <img className="sld-preview" src={url} alt="Single line diagram" />
}

export default SldPreview
