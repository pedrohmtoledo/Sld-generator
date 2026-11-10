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

## How the drawing works

The drawing is built in two stages, behind the same function (project data in, SVG string out), so stage 2 replaces stage 1 without touching the rest of the app.

### Stage 1: Pedro's first template

The first working version uses Pedro's existing hand-drawn SLD for 1 inverter, 2 strings and 1 battery (`sld-1-inv-2-string-v01.svg`, from the old `sldgenerator` repo).
- It was exported from AutoCAD to SVG with placeholder text: `{{INVERTER}}`, `{{BATTERY}}`, `{{STRING_1}}`, `{{STRING_2}}`, `{{PV_MODULES}}`, `{{MODULES_QTY}}`, `{{CUSTOMER_NAME}}`, `{{CUSTOMER_ADDRESS}}`, `{{MPRN}}`, `{{INSTALLER_NAME}}`, `{{DATE}}`.
- The app loads the SVG as text, escapes and uppercases the user's text and fills the placeholders.
- This is the only template. No more templates get drawn per combination.

### Stage 2: automatic assembly

**Decided:** after stage 1, the SLD is **generated automatically** from the project data, because drawing every combination doesn't scale.

- **Blocks (symbols):** each component (PV string, inverter, battery, isolators, protection devices, meter, grid connection, and so on) is drawn **once** as a block, with defined connection points. **Pedro draws the blocks in AutoCAD later.** Until then, use simple placeholder blocks drawn in code (boxes with labels), built so Pedro's blocks can replace them without changing the layout code.
- **Layout:** code places the blocks and draws the wires between them based on the project data (how many strings, battery or no battery, and later three-phase and multiple inverters).
- **Sheet frame:** the border, title block and legend stay fixed. The title block shows customer name, address, MPRN, installer and date (`en-IE`, DD/MM/YYYY). The bill of materials table is generated from the project data.

### Both stages

- **One entry point:** drawing generation sits behind a single function, project data in and SVG string out. The rest of the app (preview, PDF export) only calls that function.
- **Text safety:** all user text is XML-escaped (`&`, `<`, `>`) and uppercased before it goes into the SVG.
- **Output:** shown as a preview and exported to an A3 landscape PDF. The file name is `SLD-<CUSTOMER-NAME>.pdf` (uppercase, spaces → hyphens), or `SLD-DRAWING.pdf` if the name is empty.
- Drawing conventions (symbols, which devices appear, labelling, wire routing) follow Pedro's reference SLD. Ask him rather than guessing.

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

1. **Foundation:** home page, routing (home, dashboard, project page), project form and string split, drawing from the first template (stage 1), PDF export, tests and CI, then automatic assembly (stage 2). Done step by step, one PR each.
2. **Supabase:** database, sign-up/login, projects per user, protected routes.
3. **Quality:** form validation, error and loading states, README and screenshots.
4. **Product:** more system variations, string calculator.
5. **Launch:** deploy for real installers, privacy policy and terms.

## Related

Pedro's earlier learning project, `github.com/pedrohmtoledo/sldgenerator` (JavaScript), has the stage 1 SVG template and the escape and PDF export logic to carry over. Its template is also the reference for layout and conventions in stage 2. The old project stays separate. Don't change it.
