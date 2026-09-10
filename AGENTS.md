# Simple Machine Hugo Theme

Working guide + design spec for this repo. The theme lives in
`themes/simple-machine/`; content lives in `content/` (one Markdown file per machine).
This file is the source of truth for behaviour. See the [Status](#status) section for
what's done and what's pending.

## Status

### Done

- Theme implemented in `themes/simple-machine/` (layouts, CSS, JS, `theme.toml`).
- Site config (`hugo.toml`): `theme = 'simple-machine'`, `title = 'Inércia Retrocorner'`,
  `disableKinds = ['taxonomy', 'term']` (a bare list of machines, no taxonomies).
- 22 machine articles in `content/` spanning the 70s through the early 00s, each with
  `draft: false` and an `image:` field pointing to `images/<slug>.jpg`.
- Restyled to match the Inércia look (`2026.inercia.pt`): near-black dark theme as the
  default, IBM Plex Sans, lime accent (`#c8e883`), fixed glassy nav, fluid type, rounded
  cards.
- `baseURL` is the real production host (`https://retrocorner.loide.net/`). It's the
  single source of truth for URL generation and QR code content.
- QR codes: generated at build time by `scripts/gen-qr.mjs` (Node + `qrcode`
  dev-dependency) into `assets/qr/<slug>.svg`, inlined into each machine page beneath the
  Wikipedia link. Each one encodes `baseURL` host + `/<slug>/`.
- Single page resizes photos at build time to 1200px wide via `resources.Get` +
  `.Resize`, so the browser never downscales a full-size photo.
- Footer: `back to top` link (left, `href="#"`) and `inercia.party` link (right).
- `.gitignore` covers `/public/` and `/.hugo_build.lock`.
- `hugo --gc` builds with no warnings.

### Todo

- Drop the missing photos into `assets/images/`. Only `apple-ii` and `zx-spectrum`
  have photos so far; cards without a file just render no image (nothing else to change).
- Verify in a browser: theme toggle + persistence, narrow-width layout, A5 portrait
  print.
- Set GitHub Pages source to **GitHub Actions**. It's currently "Deploy from a branch"
  (Jekyll), which is why the live site renders no content.

## Working in this repo

- Hugo v0.148.2+extended; the binary used in this environment is `/tmp/hugo`
  (not installed globally).
- Root `layouts/` and `static/` are unused — all templates/CSS/JS go inside
  `themes/simple-machine/`.
- Commands:
  - `node scripts/gen-qr.mjs` — regenerate QR codes into `assets/qr/` (run before build
    or `hugo server`; required only when content or `baseURL` changes)
  - `hugo server -D` — dev server with drafts + live reload
  - `hugo --gc` — production build (must finish with no warnings)
- Delegated to GitHub Actions (see `.github/workflows/hugo.yml`): `npm ci` installs
  `qrcode`, `node scripts/gen-qr.mjs` regenerates the QRs, then Hugo builds.
- `public/`, `.hugo_build.lock`, `node_modules/` and `assets/qr/` are gitignored — never
  commit them. `package.json` + `package-lock.json` ARE committed.
- No tests, CI, or linter. Verify by serving locally and checking the Todo items above.

## Machines & content

> **IMPORTANT — slugs are permanent.** Once a machine card is created and its article
> goes live, its `slug` must NEVER change. The slug defines the URL (`/<slug>/`); changing
> it breaks every incoming link, bookmark, and indexed page. Never edit a published slug.

One Markdown file per machine in `content/`. The filename doesn't matter — the `slug`
field controls the URL (`/<slug>/`).

### Hiding a machine

Every article has `draft: false` in its front matter. Set `draft: true` on a card and
rebuild: the machine disappears from the homepage and its page stops rendering in
production builds (`hugo server -D` still shows it as a draft). The archetype
(`archetypes/default.md`) creates new files as drafts.

### Front matter

Required fields (anything else is optional and renders as a plain key–value row on the
machine page, after the fixed ones):

- `make`, `model`: strings
- `release_year`: integer
- `processor`, `ram`, `storage`: strings
- `slug`: lowercase ASCII letters, digits, hyphens only; never change after publication
- `image`: optional path to a 1:1 photo, relative to `assets/`
- `draft`: `false` by default; set `true` to hide the machine
- `wikipedia`: optional English Wikipedia article URL, rendered as a centered
  `Wikipedia` link after an `<hr>` at the bottom of the machine page

```yaml
---
make: "Acme"
model: "Widget 2000"
release_year: 1987
processor: "Intel 8088"
ram: "640 KB"
storage: "20 MB"
slug: "acme-widget-2000"
draft: false
image: "images/acme-widget-2000.png"
wikipedia: "https://en.wikipedia.org/wiki/Acme_Widget_2000"
interface: "Serial"
weight_kg: 2.5
---
Optional body text.
```

## Theme structure

```
themes/simple-machine/
  layouts/
    _default/
      baseof.html
      single.html
    index.html
    partials/
      head.html
      header.html
      footer.html
  static/
    css/style.css
    js/theme.js
  theme.toml
```

## Behaviour notes

- **Homepage**: a single sorted list of all machines — `Make Model (Year)`, alphabetical
  by make, then model, then year. Uses `.RelPermalink`; never hardcode URLs.
- **Single page**: `<h1>` (`Make Model`), square 1:1 photo at 50% width, a `<dl>` with
  the six fixed fields in order, then any extra front matter fields, then body text, then
  an action row with the Print button and the QR code side by side, set at the end of the
  details column (Wikipedia link follows below). Extra-field rendering skips Hugo
  built-in keys via the `$skip` list in `single.html`.
- **QR codes**: inline SVG sourced from `assets/qr/<slug>.svg` (generated by
  `scripts/gen-qr.mjs`, gitignored). The template does `resources.Get` +
  `.Content | safeHTML` — if the SVG is missing the span silently renders nothing.
  The QR encodes `baseURL` + `/<slug>/`; since slugs never change, the QR never breaks
  for any given published card. On the page it sits beside the Print button inside the
  `.machine-actions` flex row, and stays visible in print.
- **Image rule**: the `<img>` must NOT carry `width`/`height` attributes — they set a
  definite height that defeats `aspect-ratio` and makes the image render rectangular.
  The box is sized purely by CSS (`width: 100%` in the 50% column + `aspect-ratio: 1 / 1`).
- **Photos**: keep them in `assets/images/` (NOT `static/`, which Hugo can't process).
  `resources.Get` is nil-safe — a missing file just means no image. The resized file is
  emitted to `public/` at build time.
- **Header**: site title links to the homepage, styled in text colour (not link colour);
  a plain-text `Theme` toggle button sits beside it.
- **Footer**: `back to top` link left, `inercia.party` link right, laid out with flexbox.
- **Theme toggle** (`js/theme.js`): defaults to dark for visitors with no saved choice,
  reads `localStorage` for a stored preference, sets `data-theme` on `<html>`; toggling
  persists the choice.

## Design rules

- Dark theme is the default (new visitors get it); a plain-text `Theme` button toggles
  to light and the choice persists via `localStorage`.
- Looks like inercia: `IBM Plex Sans` (loaded from Google Fonts, with system fallback),
  near-black background `#061213`, lime accent `#c8e883` for links/overlines/borders,
  `letter-spacing: -0.0275em` on headings, uppercase bold overlines, fixed glassy nav
  (`backdrop-filter: blur`), rounded cards with subtle white-alpha borders.
- Light mode keeps the same accents on a warm off-white background.
- Responsive: fluid layout, `max-width` ~68rem, fluid clamp type/spacing, no horizontal
  scroll at narrow widths, `box-sizing: border-box`.
- Print: `@page { size: A5 portrait; margin: 12mm; }`, black-on-white, hide the nav,
  footer, toggle, print button, back link and Wikipedia link; `break-inside: avoid` on
  `h1`/`dl`.
- No emoji or icons; decorative-only imagery is out, machine photos are content.

## Acceptance criteria

- Homepage lists every machine; clicking one opens its page.
- URL is always `/<slug>/` — changing title or filename doesn't change it, and QR codes
  are generated from the immutable slug.
- Both themes work and persist; dark is the default for first-time visitors.
- Print output is A5 portrait and contains only the machine details.
- Usable on mobile and desktop; no emoji, icons, or external fonts.