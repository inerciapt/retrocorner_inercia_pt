# Simple Machine Hugo Theme

This file is both the working guide and the design spec for this repo. The theme is
implemented in `themes/simple-machine/` with example content in `content/`; the spec
below is the source of truth for behaviour. See the [Status](#status) section for what
is done and what is still pending.

## Status

### Done

- Theme implemented in `themes/simple-machine/` (templates, CSS, JS, `theme.toml`).
- `hugo.toml` configured: `theme = 'simple-machine'`, `title = 'Inércia Retrocorner'`,
  `disableKinds = ['taxonomy', 'term']` (a bare list of machines, no taxonomies;
  `'taxonomyTerm'` is deprecated, use `'term'`).
- `.gitignore` added for `/public/` and `/.hugo_build.lock`.
- Site title in the header is a link back to the homepage (machine list), using
  `.Site.Home.RelPermalink`.
- Footer contains a single link: text `go back to` pointing to `https://inercia.party`.
- Example articles: `content/apple-ii.md` (`/apple-ii/`) and
  `content/commodore-64.md` (`/commodore-64/`), both with an `image:` field.
- Machine photos in `assets/images/` (`apple-ii.jpg`, `zx-spectrum.jpg`); the single
  page resizes them at build time to 1200px wide via `resources.Get` + `.Resize`,
  so the browser never has to downscale a full-size photo. `commodore-64.jpg` is
  referenced in front matter but the file is missing, so that page renders no image.
- Fixed rectangular-image bug: the `<img>` must NOT carry `width`/`height` attributes —
  they become presentational CSS hints (a definite height), so `aspect-ratio` is ignored
  and the box renders non-square. The box is sized purely by CSS
  (`width: 100%` in the 50% grid column + `aspect-ratio: 1 / 1`).
- `hugo --gc` builds with no warnings.

### Todo

- Add the missing `commodore-64.jpg` photo to `assets/images/`.
- Verify in a browser: light/dark toggle + persistence, system-preference detection,
  responsive at narrow widths, A5 portrait print.
- Set a real production `baseURL` (currently `https://example.org/`) before publishing.
- Add remaining machine articles (one file per machine in `content/`).
- Nothing is committed yet beyond the scaffold `Initial commit`; commit the theme work
  when appropriate.

## Working in this repo

- Hugo v0.148.2+extended is installed. `hugo.toml` has `theme = 'simple-machine'` set.
  The root `layouts/` and `static/` directories are unused; all templates/CSS/JS go
  inside `themes/simple-machine/`.
- Commands:
  - `hugo server -D` — dev server with drafts and live reload
  - `hugo --gc` — production build with garbage collection (must finish with no warnings)
- Generated artifacts `public/` (build output) and `.hugo_build.lock` are gitignored
  and must not be committed.
- No tests, CI, or linter. Verify by serving locally: dark/light toggle, system
  preference detection, responsive at narrow widths, and A5 portrait print output.
- Content files are one per machine in `content/`. The archetype
  `archetypes/default.md` creates drafts (`draft = true`) and does not include the
  required front matter; the `slug` is added per file and is never derived from the
  filename or title.

## 1. Purpose

Build a Hugo theme for a simple website that catalogues machines. Each article describes one machine. The site has no navigation menus, only a list of machines. Each machine has a stable URL based on an explicit slug.

## 2. Hard Requirements

- Light and dark mode, with manual toggle and system preference detection.
- Fully responsive layout.
- Print option on each machine page for A5 sheets in portrait orientation.
- No emoji.
- No decorative frills, icons, or external fonts.
- No navigation menus. The homepage is a single list of all machines.
- Stable links: every machine page uses an explicit `slug` field. Slugs must not change after publication.
- Use system font stack.
- Use plain text for interactive controls.

## 3. Content Model

Content files are Markdown files in `content/`, one file per machine. The file name does not affect the final URL; the `slug` field controls it.

### 3.1 Front Matter

Required fields (additional fields are allowed and rendered as a plain key-value list after the fixed ones):

- `make`: string
- `model`: string
- `release_year`: integer
- `processor`: string
- `ram`: string
- `storage`: string
- `slug`: string, lowercase letters, digits, and hyphens only
- `image`: optional string path to a 1:1 picture of the machine, relative to
  `assets/` (must be excluded from the additional-fields list; resized at build time
  to 1200px wide, so the browser never downscales the full-size file)

```yaml
---
make: "Acme"
model: "Widget 2000"
release_year: 1987
processor: "Intel 8088"
ram: "640 KB"
storage: "20 MB"
slug: "acme-widget-2000"
image: "images/acme-widget-2000.png"
interface: "Serial"
weight_kg: 2.5
---
Optional body text.
```

### 3.2 Slug Rules

- `slug` is mandatory; URL is `/<slug>/`.
- Use only lowercase ASCII letters, digits, and hyphens.
- Never change a published slug. Never generate URLs from title, date, or filename.

## 4. Theme Structure

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
    css/
      style.css
    js/
      theme.js
  theme.toml
```

## 5. Layout Behaviour

### 5.1 Base Template

`baseof.html` provides the HTML5 document structure: a `head` partial (loads `style.css` and `theme.js`), a `header` partial (site title as a link to the homepage plus a theme toggle button), a `main` block, and a `footer` partial. No navigation menu, sidebar, or breadcrumbs.

### 5.2 Homepage List

`index.html` lists all machine pages in a single list, sorted alphabetically by `make`, then `model`, then `release_year` ascending. Link text: `Make Model (Year)`. Use `.RelPermalink`; never hardcode URLs.

```html
<ul class="machine-list">
  {{ range sort .Site.RegularPages "Params.make" "asc" }}
    <li>
      <a href="{{ .RelPermalink }}">{{ .Params.make }} {{ .Params.model }} ({{ .Params.release_year }})</a>
    </li>
  {{ end }}
</ul>
```

### 5.3 Single Machine Page

`single.html` shows: an `<h1>` with `Make Model`; the machine image (`image` field, square 1:1, 50% of page width, top-left aligned, beside the details); a `<dl>` with the fixed fields in order Make, Model, Release Year, Processor, RAM, Storage; any additional front matter fields after those; the body content; and a `Print` button calling `window.print()` that is hidden in print output.

```html
<h1>{{ .Params.make }} {{ .Params.model }}</h1>
{{ with resources.Get (.Params.image) }}
  {{ with .Resize "1200x" }}
    <img class="machine-image" src="{{ .RelPermalink }}" alt="{{ $.Params.make }} {{ $.Params.model }}">
  {{ end }}
{{ end }}
<div class="machine-details">
  <dl>
    <dt>Make</dt>
    <dd>{{ .Params.make }}</dd>
    <dt>Model</dt>
    <dd>{{ .Params.model }}</dd>
    <dt>Release Year</dt>
    <dd>{{ .Params.release_year }}</dd>
    <dt>Processor</dt>
    <dd>{{ .Params.processor }}</dd>
    <dt>RAM</dt>
    <dd>{{ .Params.ram }}</dd>
    <dt>Storage</dt>
    <dd>{{ .Params.storage }}</dd>
    {{ $skip := slice "aliases" "build" "cascade" "categories" "date" "description" "draft" "expirydate" "headless" "image" "iscjklanguage" "keywords" "layout" "linktitle" "markup" "outputs" "publishdate" "resources" "slug" "summary" "tags" "title" "type" "url" "weight" "make" "model" "release_year" "processor" "ram" "storage" }}
    {{ range $key, $value := .Params }}
      {{ if not (in $skip $key) }}
        <dt>{{ humanize $key }}</dt>
        <dd>{{ $value }}</dd>
      {{ end }}
    {{ end }}
  </dl>
  {{ with .Content }}
    <div class="content">{{ . }}</div>
  {{ end }}
  <button class="print-button" type="button" onclick="window.print()">Print</button>
</div>
```

The additional-field loop must skip the required fields, the `image` field, and any
Hugo built-in front matter keys that may appear in `.Params`. Convert non-string values
to strings for display. The `<img>` must carry NO `width`/`height` attributes: they
become presentational CSS hints that fix a definite height, defeat `aspect-ratio`, and
make the image render rectangular.

Images live in `assets/images/` (NOT `static/`, which Hugo cannot process).
`resources.Get` resolves the `image:` front matter path relative to `assets/` and
returns nil for a missing file, so a page simply renders no image. The resized
1200px-wide file is emitted to `public/` at build time.

### 5.4 Partials

- `head.html`: meta charset, viewport, title (`Make Model`), stylesheet link, theme script.
- `header.html`: site title as a link to the homepage (`<a class="site-title">`, styled
  in text colour, not link colour) and a plain-text theme toggle button whose text is
  `Theme` and whose `aria-label` describes the action it performs on click.
- `footer.html`: a single link with text `go back to` pointing to
  `https://inercia.party`.

## 6. CSS Requirements

`static/css/style.css` implements all styling.

### 6.1 Light and Dark Mode

Use CSS custom properties on `:root` for light mode and an attribute selector for dark:

```css
:root {
  --background: #ffffff;
  --text: #111111;
  --link: #0055aa;
  --border: #cccccc;
}

[data-theme="dark"] {
  --background: #111111;
  --text: #eeeeee;
  --link: #88ccff;
  --border: #444444;
}
```

`data-theme` is set on the `<html>` element by JavaScript.

### 6.2 Responsive Design

- Fluid layout, `max-width` around 60rem, relative units (`rem`, `%`, `em`).
- CSS Grid or Flexbox for the machine list and definition list.
- Machine page image: a `.machine` two-column grid (`grid-template-columns: 50% 1fr`),
  image in column 1, top-left aligned, `width: 100%` of the column, `aspect-ratio: 1 / 1`,
  `object-fit: cover`. The `<img>` carries no `width`/`height` attributes so the CSS
  ratio is honoured and the box stays square.
- No horizontal scrolling at narrow mobile widths. `box-sizing: border-box`.

### 6.3 Print Styles

Inside `@media print`: set `@page { size: A5 portrait; margin: 12mm; }`, force black text on white, hide `.theme-toggle`, `.print-button`, `header`, `footer`, and remove link styling. Add `break-inside: avoid` to `h1` and `dl` so output fits on one A5 portrait sheet.

## 7. JavaScript Requirements

`static/js/theme.js`:

- On load: check `localStorage` for a stored theme; if none, use `window.matchMedia('(prefers-color-scheme: dark)')`; set `data-theme` on `<html>` to `light` or `dark`.
- Toggle button flips `light`/`dark`, updates `data-theme`, saves to `localStorage`, and has an `aria-label` describing its action.

## 8. Accessibility

- Semantic HTML: `<main>`, `<header>`, `<footer>`, `<article>`, `<dl>`, `<dt>`, `<dd>`.
- Sufficient text contrast in both modes; visible focus style; keyboard-accessible toggle and print button.
- Do not use colour alone to convey meaning.

## 9. Acceptance Criteria

- Homepage lists all machines as a single plain list; clicking an item opens the machine page.
- Machine page URL is `/<slug>/`; changing title or filename does not change the URL.
- Light and dark modes both work and persist across loads; dark mode follows system preference when no manual choice has been made.
- Theme toggle is a plain text button.
- Machine page has a visible Print button; print output targets A5 portrait and contains only the machine details.
- Layout is usable on mobile and desktop.
- No emoji, icons, decorative images, or external fonts in the theme.
