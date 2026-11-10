# SLD Generator: instructions for Claude

Read this before working in the repo. It applies to every session.

## The product

A web app for solar installers in Ireland. The installer enters the details of a PV system and gets a professional single line diagram (SLD), like a classic AutoCAD SLD, ready to download as an A3 PDF. Projects are saved so they can be opened, edited and downloaded again. It's built to be deployed for real users, not just as a portfolio piece.

**v1 scope:** single-phase, one inverter, two strings, one battery stack.
- Modules are split evenly across the two strings, and any remainder goes to string 1 (41 → 21 / 20).
- Equipment (module model, inverter, battery) is free text typed by the user, not picked from a component library.
- There's no string voltage validation yet. A string calculator comes later.
- The output is labelled as a drawing for review; a qualified person signs off.

**Project data:** `customerName`, `customerAddress`, `mprn` (11 digits), `installerName`, `modulesModel`, `modulesQty`, `inverter`, `battery`, plus the calculated `strings` array and an `id`.

## How the drawing works (for now)

- Pedro draws the SLD in AutoCAD as a template and exports it to SVG with placeholder text: `{{INVERTER}}`, `{{BATTERY}}`, `{{STRING_1}}`, `{{STRING_2}}`, `{{PV_MODULES}}`, `{{MODULES_QTY}}`, `{{CUSTOMER_NAME}}`, `{{CUSTOMER_ADDRESS}}`, `{{MPRN}}`, `{{INSTALLER_NAME}}`, `{{DATE}}` (`en-IE`, DD/MM/YYYY).
- The app loads the SVG as text, XML-escapes the user's text (`&`, `<`, `>`), uppercases it, fills the placeholders, shows the result and exports it to an A3 landscape PDF.
- The PDF file name is `SLD-<CUSTOMER-NAME>.pdf` (uppercase, spaces → hyphens), or `SLD-DRAWING.pdf` if the name is empty.
- **Under review:** switching from one template per combination to generating the diagram from a symbol library plus layout rules. Keep drawing generation behind a single function (project data in, SVG string out) so the approach can change without touching the rest of the app.

## Stack

TypeScript · React + Vite · React Router · Supabase (Postgres + auth; each installer sees only their own projects) · jsPDF + svg2pdf.js · Vercel · Vitest, with checks on every PR.

## How we work

- **Claude writes the code; Pedro reviews, runs it locally and merges.**
- One feature per branch, as a pull request.
- **Never push to `main` and never merge.** Only push to your own feature branches and open PRs. `main` is protected by a GitHub ruleset.
- Each PR **explains every file it adds or changes in plain language**, especially the TypeScript parts. Pedro is new to TypeScript (he knows some JavaScript, React basics from Full Stack Open parts 0–3, and Express basics).
- Most PRs leave Pedro **a small task** to do himself, so he understands and owns the code.
- Prefer **simple, readable code** over clever code, and **simple CSS**.
- When Pedro asks to "explain", give the concept step by step with examples from this project, not just the fix.
- **Never ask for passwords, API keys or connection strings in chat.** They go in a local `.env` (git-ignored) and in the hosting dashboards. The repo is public, so secrets must never be committed.
- Handle personal data (customer names, addresses, MPRNs) with GDPR in mind.
- Pedro is the domain expert in solar installations, SLDs and AutoCAD. Ask him about electrical or drawing conventions rather than guessing.

## Roadmap

1. **Foundation:** home page, routing (home, dashboard, project page), project form and string split, drawing generation, PDF export, tests and CI. Done step by step, one PR each.
2. **Supabase:** database, sign-up/login, projects per user, protected routes.
3. **Quality:** form validation, error and loading states, README and screenshots.
4. **Product:** more system variations, string calculator.
5. **Launch:** deploy for real installers, privacy policy and terms.

## Related

Pedro's earlier learning project, `github.com/pedrohmtoledo/sldgenerator` (JavaScript), has the original SVG template and the fill/escape/PDF logic to carry over. It stays separate. Don't change it.
