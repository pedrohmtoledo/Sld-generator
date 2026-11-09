// The landing page: the first thing an installer sees.
// It's a plain function that returns JSX, with no props and no state yet.

// A list of selling points. Keeping them in an array means adding one
// is a one-line change, and .map() below turns each into an <li>.
const features: string[] = [
  'Enter the PV system details once: modules, inverter, battery and customer.',
  'Get a single line diagram laid out like a classic AutoCAD drawing.',
  'Download it as an A3 PDF, ready for review and sign-off.',
]

function HomePage() {
  return (
    <main className="home">
      <h1>SLD Generator</h1>
      <p className="tagline">
        Single line diagrams for solar installers in Ireland, in minutes
        instead of hours.
      </p>

      <ul className="features">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {/* The dashboard page arrives in the routing PR. Until then this link goes nowhere. */}
      <a className="button" href="/dashboard">
        Get started
      </a>
    </main>
  )
}

export default HomePage
