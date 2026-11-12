# SLD Generator: instructions for Claude

Read this before working in the repo. It applies to every session.

## The product

A web app for solar installers in Ireland. The installer enters the details of a PV system and gets a professional single line diagram (SLD), like a classic AutoCAD SLD, ready to download as an A3 PDF. Later, installers can log in and save projects. It's built to be deployed for real users, not just as a portfolio piece.

**v1 scope (decided 12 Nov 2026):**
- **One inverter, two strings, no battery.**
- **Single-phase or three-phase.** The only difference on the drawing is the AC cables: single-phase is `1L+1N`, three-phase is `3L+1N`. The blocks are the same.
- Modules are split evenly across the two strings, and any remainder goes to string 1 (41 → 21 / 20).
- Equipment (module model, inverter) is free text typed by the user, not picked from a component library.
- There's no string voltage validation yet. A string calculator comes later.
- The output is labelled as a drawing for review; a qualified person signs off.
- **Out of scope for v1:** batteries, more than one inverter, more than two strings, microinverters, optimisers, EV chargers, off-grid.

**Project data:** `customerName`, `customerAddress`, `mprn` (11 digits), `installerName`, `phase` (single or three), `modulesModel`, `modulesQty`, `inverter`, plus the calculated `strings` array and an `id`. **Cable sizes are calculated by the app**, not typed by the installer. Pedro provides the calculation rules (inputs and tables); don't invent electrical sizing rules. Whether isolator ratings are calculated the same way is still open. The `battery` field from stage 1 goes away in stage 2.

## How the drawing works

The drawing sits behind **one function: project data in, SVG string out**. The rest of the app (preview, PDF export) only calls that function, so stage 2 replaces stage 1 without touching anything else.

### Stage 1: Pedro's first template (done, PR #4)

Pedro's hand-drawn SLD (`sld-1-inv-2-string-v01.svg`) filled with placeholder text. It's the only template. No more templates get drawn per combination.

### Stage 2: automatic assembly

The SLD is **assembled automatically** from blocks Pedro draws in AutoCAD. Code places the blocks and draws the wires and labels from the project data.

**v1 blocks** (Pedro draws these):

| Block | Connection points | Notes |
|---|---|---|
| PV string | `OUT` | One per string, so drawn twice in v1 |
| Fireman switch | `DC1_IN`, `DC2_IN`, `DC1_OUT`, `DC2_OUT`, `SUPPLY` | **4-pole, one switch for both strings.** (A 10-pole version for more strings comes later.) Powered from the spur switch. |
| DC isolator | `IN`, `OUT` | Next to the inverter |
| Inverter | `DC1`, `DC2`, `AC_OUT`, `COMMS` | **Earth drawn inside the block** |
| AC isolator | `IN`, `OUT` | **One per inverter**, in the inverter board |
| Spur switch | `IN`, `OUT` | In the inverter board, feeds the fireman switch |
| Inverter board | (frame) | Enclosure outline drawn around the AC isolator and spur switch |
| RCBO | `IN`, `OUT` | The inverter's RCBO in the main distribution board |
| Sheet frame | none | Border, title block, legend. Title block has placeholders for customer name, address, MPRN, installer, date (`en-IE`, DD/MM/YYYY). |

**Fixed section** (the same on every drawing, drawn once by Pedro as one piece): **main distribution board, meter and CT clamps, ESB meter**, with the **earth drawn inside the main distribution board**. The RCBO block connects into it.

**Labels the code writes** (not blocks):
- **Cable labels** on each wire: cable type and size. AC cables show `1L+1N` (single-phase) or `3L+1N` (three-phase).
- **Ratings in amps** next to the fireman switch, DC isolator, AC isolator, spur switch and RCBO.

**Drawing rules for every block** (so the code can join them up):
1. One block per file, drawn at 1:1 in millimetres on a shared grid (e.g. 5 mm), with the insertion point at 0,0.
2. **Connection points:** a small **red circle (`#ed1f24`)** at each point where a wire attaches, on the block's outer edge, with its name next to it (`IN`, `OUT`, `DC1`, …). Red is used for nothing else. The **insertion point** is a small **blue cross (`#0000ff`)** at the block's bottom-left, and blue is used for nothing else. The code reads both, then **hides them and their labels** in the final drawing.
   - Draw each block at its **printed size on A3** (the inverter symbol is about 16 mm), so tiny blocks don't get rounded by the PDF export. Printed text is about 2–2.5 mm tall.
3. Text that changes is placeholder text: `{{MODEL}}`, `{{QTY}}`, `{{RATING}}`, `{{LABEL}}`. Same TrueType font as the stage 1 template.
4. Same export path as stage 1: AutoCAD → PDF → Inkscape → Plain SVG, with text kept as text.
5. Same line weights and text height across all blocks.

**Block files** go in `src/drawing/blocks/<block-name>.svg` (e.g. `pv-string.svg`, `inverter.svg`). Pedro keeps the source in one DWG with a layout per block and sends the exported SVGs; add them in a PR.

**Until Pedro's blocks exist,** use simple placeholder blocks drawn in code (labelled boxes with the same connection points), built so his SVGs can drop in without changing the layout code.

**Pilot first:** Pedro draws the PV string, DC isolator, inverter and sheet frame first. Build the assembler on those, check the result with him, then do the rest the same way.

### Always

- **Text safety:** all user text is XML-escaped (`&`, `<`, `>`) and uppercased before it goes into the SVG.
- **Output:** a preview plus an A3 landscape PDF named `SLD-<CUSTOMER-NAME>.pdf` (uppercase, spaces → hyphens), or `SLD-DRAWING.pdf` if the name is empty.
- Drawing conventions (symbols, labelling, wire routing) follow Pedro's reference SLD. Ask him rather than guessing.

## Stack

TypeScript · React + Vite · React Router · Supabase (Postgres + auth) · jsPDF + svg2pdf.js · Vercel · Vitest, with checks on every PR.

## How we work

- **Claude writes the code; Pedro reviews, runs it locally and merges.**
- One feature per branch, as a pull request.
- **Never push to `main` and never merge.** Only push to your own feature branches and open PRs. `main` is protected by a GitHub ruleset.
- Each PR **explains every file it adds or changes in plain language**, especially the TypeScript parts. Pedro is new to TypeScript (he knows some JavaScript, React basics from Full Stack Open parts 0–3, and Express basics).
- Prefer **simple, readable code** over clever code, and **simple CSS**.
- When Pedro asks to "explain", give the concept step by step with examples from this project, not just the fix.
- **Never ask for passwords, API keys or connection strings in chat.** They go in a local `.env` (git-ignored) and in the hosting dashboards. The repo is public, so secrets must never be committed.
- Handle personal data (customer names, addresses, MPRNs) with GDPR in mind.
- Pedro is the domain expert in solar installations, SLDs and AutoCAD. Ask him about electrical or drawing conventions rather than guessing.

## Roadmap

Done: home page, routing, project form + string split, stage 1 drawing (PRs #1–#4).

1. **PDF export and tests:** A3 PDF download, Vitest set up with tests for the string split and escaping, tests run on every PR.
2. **Pilot blocks:** assembler with placeholder blocks, then Pedro's PV string, DC isolator, inverter and sheet frame.
3. **Full v1 block set:** fireman switch, AC isolator, spur switch, inverter board, RCBO, fixed main board / meter / CT / ESB section, cable and rating labels, single- vs three-phase.
4. **Generator tests and review gallery:** automatic tests for every v1 configuration, plus a page showing them all side by side for Pedro to check by eye.
5. **Public generate page (no customer data saved) and deploy:** anyone can generate and download an SLD. Save only the equipment entries (module, inverter, quantities; no name, address or MPRN) to a Supabase table, with a note on the page saying so. Deploy on Vercel.
6. **Login and saved projects:** Supabase auth, each user can only read their own rows (row level security), EU region, store only what the drawing needs, users can delete projects, privacy policy. Field-level encryption of name, address and MPRN is decided as a separate step after that.
7. **String calculator:** using the collected equipment data and datasheet values.

## Related

Pedro's earlier learning project, `github.com/pedrohmtoledo/sldgenerator` (JavaScript), has the stage 1 template and the PDF export logic to carry over. It stays separate. Don't change it.
