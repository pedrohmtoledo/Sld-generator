# SLD Generator

A web app for solar installers in Ireland: enter the details of a PV system and get a single line diagram (SLD) as an A3 PDF.

## Run it locally

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install     # install dependencies (first time only)
npm run dev     # start the dev server, then open the URL it prints
```

Other scripts:

- `npm run build` checks the TypeScript and builds the production version into `dist/`
- `npm run lint` checks the code for common mistakes
- `npm run preview` serves the built version locally

## Tech

React + TypeScript, built with Vite.
