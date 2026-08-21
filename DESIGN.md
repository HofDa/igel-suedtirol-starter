# Design

<!-- impeccable:design-schema 1 -->

## Direction contract

**THESIS.** This is a welcoming public service for someone who may be holding a
phone outdoors and using a citizen-science platform for the first time. It must
feel calm, friendly and obvious before it feels scientific. Every colour comes
from the b\*nature Igelprojekt logo, but the interface uses those colours in
large, soft shapes with generous whitespace instead of turning the page into a
field instrument.

**OWN-WORLD.** This project is a subsite of b\*nature (bnature.bz) and wears the
parent's clothes — with one deliberate exception. White and sand `#f3eee7`
alternate as the page ground and neutral `#374151` is the ink, both from the
parent. But the action colour is the project's **own** logo green `#1ea600`,
taken unchanged from the Igelprojekt mark, not the parent's forest green. It
fills every primary button and carries **dark** labels rather than white ones,
because that is what makes it legible. First-level headings take the darkened
`#166f00`. A second colour is the subsite's own: logo pink `#fb8cdb`, which
brings warmth through soft decorative areas and identifies map data, but never
carries text. Warnings get their own colour so pink and green keep their
meaning. The logo's dashed road line remains the system's mark for "provisional
— not yet evidence". Inter carries all ordinary public UI, exactly as on the
parent site; Martian Mono is this subsite's own addition and is restricted to
genuine scientific readouts, which the parent site has no need for.

**STORY.** A stranger who has just found a hedgehog understands within one
viewport that this is where it gets reported, that it takes about a minute, and
that their exact garden will not appear on a public map. They report. An expert
later sees the same record with its uncertainty intact.

**FIRST VIEWPORT.** A sand hero band exactly as on the parent site, large
breathing room, rounded organic washes in leaf green and blossom pink, and two
unmistakably different actions above the fold, side by side in one card split
by a single hairline: Citizen Science on the white half in the filled leaf
green, calm SOS help on a warning-tinted half. Neither is subordinate to the
other, and the split is the same one the report chooser uses. The
privacy mechanism is stated in one plain sentence directly under those
actions, where the parent site puts its own trust line; coordinates and
cartographic grids do not confront a first-time visitor, and neither does a
diagram explaining a mechanism the sentence already covers.

**FORM.** The reporting flow is a guided conversation, not a field-record
terminal. One familiar rounded progress bar, one question at a time, spacious
choice rows, reassuring hints and clear back/continue actions. Scientific detail
is collected without making the finder feel as if they must understand the
data model.

The shared `/melden` entry uses four icon-led cards; colour reinforces but never
defines their meaning. SOS content never starts with a form. Roadkill is a short
variant of the scientific assistant, while a hazardous road section has its own
model and visual wording because no animal needs to have been observed.

## Colour

Tokens live in `src/app/globals.css` under `@theme`. Never write a hex value in
a component; never use a raw Tailwind palette colour (`red-50`, `slate-700`).

### Brand colours, taken unchanged from the parent site

The sand and the deep-green ladder are lifted verbatim from the b\*nature
stylesheet. The action green and the pink are the project's own, sampled from
the logo file: 72% of the mark's green pixels sit on `#1da600`, confirming the
`#1ea600` its brand notes declare.

| Token     | Value     | Source                                             |
| --------- | --------- | -------------------------------------------------- |
| `leaf`    | `#1ea600` | green of the Igelprojekt logo — **the action**     |
| `bn-600`  | `#2f6b3d` | the parent's mid green — "verified"                |
| `sand`    | `#f3eee7` | the parent's second page ground                    |
| `blossom` | `#fb8cdb` | pink of the figure in the Igelprojekt wordmark     |

### Roles

| Role           | Light      | Dark        | Use                                       |
| -------------- | ---------- | ----------- | ----------------------------------------- |
| `ground`       | `#ffffff`  | `#0d1016`   | page                                      |
| `band`         | `#f3eee7`  | `#111318`   | the alternating section ground            |
| `surface`      | `#ffffff`  | `#171b25`   | cards, raised panels                      |
| `well`         | `#f5f1ea`  | `#1e232c`   | inputs and insets                         |
| `line`         | ink @ 16%  | `#e2e8f0` @ 16% | borders, rules                        |
| `ink`          | `#374151`  | `#e4e4e7`   | primary text                              |
| `ink-dim`      | `#4b5563`  | `#d4d4d8`   | secondary text                            |
| `ink-faint`    | `#5d6673`  | `#a1a1aa`   | tertiary, disabled                        |
| `primary`      | `#1ea600`  | `#1ea600`   | action fills — the logo green, unchanged  |
| `primary-ink`  | `#14120d`  | `#0a1503`   | labels sitting on `primary` — never white |
| `primary-deep` | `#166f00`  | `#3fd41f`   | green that is itself text, icon or h1     |
| `accent`       | `#fb8cdb`  | `#fb8cdb`   | decorative fills and map data; never text |
| `danger`       | `#b91c1c`  | `#fca5a5`   | errors, destructive                       |
| `success`      | `#2f6b3d`  | `#71bf90`   | confirmed, validated                      |

Rules:

1. **Green is the only action colour, and it is the logo's own leaf green.**
   `#1ea600` fills every primary button, unchanged. It carries **dark** labels,
   not white ones: white on leaf is 3.23:1 and fails, near-black `#14120d` on
   leaf is 5.80:1 and passes. This is the whole trick — the mark stays exactly
   as drawn and the label adapts to it. Hover *brightens* to `#23bd00`;
   darkening would read as "pressed".
2. **Green that is itself text, an icon or a first-level heading uses
   `primary-deep`.** Leaf on the white ground is 2.96:1, far below the floor
   for text, so green text, icons, badges and every `h1` use the darkened leaf
   `#166f00` — 6.35:1 on white and 5.50:1 on sand. Same hue, legible weight.
   Section headings stay in `ink`, so the page keeps a hierarchy of colour.
3. **Where leaf meets a light ground as a shape, it gets a dark hairline.**
   As a fill, leaf is 3.23:1 against white and only **2.80:1 against the sand
   band** — under the 3:1 floor for component outlines. So every leaf shape on
   a light ground carries a 1px ink hairline: primary buttons, the step
   transport's filled bar, and the checked indicator on choice cards. The same
   applies to pink, whose 2.13:1 fill never carries its own contrast: every
   pink shape on the map and in the legend is drawn with an ink outline.
4. **Bright green means act; deep green means confirmed.** `success` `#2f6b3d`
   sits far enough from the leaf that the hue itself tells them apart again.
   A validated record never looks like a button, and a button never looks
   validated.
5. **Pink never carries text and is never a warning or action.** It can appear
   as a soft organic background, a small decorative dot, or observation data on
   maps. Its warmth makes public pages friendlier without competing with green.
6. **Warnings have their own colour.** `danger` is distinct from both pink and
   green, and always carries an icon plus a stated recovery. Never signal by
   colour alone.
7. **Secondary text is a named token, never an opacity.** `ink-dim` and
   `ink-faint` are the parent's neutral grays, stepped and contrast-checked:
   10.31:1, 7.56:1 and 5.04:1 against the lightest ground each one stands on.
   Opacity-on-ink is not a substitute — the parent site itself leans on
   `text-bark-700/70`, which lands at 4.0:1 and would fail here. A public
   reporting platform holds the higher value; this is the one place where the
   subsite deliberately departs from the parent.
8. **Depth is lightness, not glow.** Elevate by stepping `ground → surface →
well`. Shadows carry a real offset and blur; a zero-offset coloured halo is
   banned.
9. **The dashed line is a meaning, not a decoration.** It comes from the road
   marking under the logo and marks anything provisional: demo counters, the
   starter notice, the unreviewed status badge, the pending legal texts.
10. **The dark rendition borrows the parent's ground, not its green.** Ground
    `#0d1016` and the neutral steps come from bnature.bz. The action fill stays
    the logo's own `#1ea600` in both renditions — 5.90:1 against that ground —
    and keeps its dark label. Only green *text* changes: on the dark ground the
    leaf drops below the floor, so text, icons and headings switch to the
    brightened `#3fd41f`.
11. **The logo sits on a white plate, because the asset demands one.** The
    current PNG is not knocked out — every pixel is opaque over a near-white
    `#fefefe` ground — so the mark carries its own white rectangle wherever it
    goes. `logo-plate` is therefore white in both renditions: invisible against
    the white header and footer, and merged with the artwork's own ground in
    the dark one rather than framing it with a second rectangle. Every surface
    that hosts the logo must be white until a real knocked-out SVG replaces the
    file.
12. The light rendition is always the public default. A future explicit
    `data-theme='dark'` control may opt into the dark one; the device setting
    does not switch it automatically.

## Type

- **Inter** — display and UI. Weights 400, 500, 600, 700. The parent site's
  typeface. Served locally from `@fontsource/inter`; no third-party font fetch,
  per PRODUCT.md — the parent loads it from Google Fonts, this subsite does not.
- **Martian Mono** — instrument readouts only, weights 400 and 600, tabular
  numerals. This is the subsite's one typographic addition: the parent site
  publishes no measured values and has no use for it. Legitimate uses: occurrence IDs, latitude/longitude, accuracy in
  metres, step counters, grid references, dates in data context. Using it to
  make prose look technical is a violation.

Scale is a token ladder, not ad-hoc Tailwind sizes, and it is tuned to the
parent's restraint: 48px for a page's single display line, 36px for a marketing
section heading, 24px for a form step's question. Body measure stays between 65
and 75 characters. Tracking tightens as size grows and never passes `-0.025em`,
which is the parent's own value.

Weight carries hierarchy the way the parent site does it: **600 for every
heading, label and action, 400 for everything else, 500 only for navigation.**
There is no 700 or 800 anywhere in the interface. Emphasis comes from size and
colour, not from a heavier cut.

## Layout and rhythm

Whitespace is a primary design material. Public pages use generous vertical
space, short readable lines and soft grouping instead of grids, rules and
instrument panels. Organic circles and hills echo leaves, flowers and garden
habitats.

Sections alternate between the white `ground` and the sand `band`, which is the
parent site's basic page rhythm: every page opens on a sand hero and drops to
white for its content.

The radius ladder is the parent's: `0.75rem` for anything you touch — buttons,
inputs, insets — `1rem` for tiles and choice cards, `1.5rem` for large panels
and images. Buttons are **not** pills; the parent's are 12px-radius rectangles
and so are these.

## Relationship to b\*nature

This is a subsite. Where the parent site has made a decision, this system takes
it rather than inventing a parallel one: the sand, the neutral ink, Inter, the
radius ladder, the flat neutral shadows, the section rhythm, the deep green of
"verified" and the very idea of a green first-level heading all come from
bnature.bz unchanged.

Four things are deliberately this subsite's own, and each has a reason:

1. **The action green.** `#1ea600` comes from the Igelprojekt logo, not from
   the parent's palette. The mark sits in the header of every page, and an
   action colour that disagreed with the logo directly beneath it would read
   as two brands stapled together. The cost is real and is paid openly: this
   green is light, so its labels are dark and its shapes carry a hairline,
   where the parent's darker green needed neither. That cost buys a site that
   matches its own logo.
2. **Blossom pink** identifies observation data and warms the public pages. It
   comes from the Igelprojekt wordmark and has no counterpart on the parent.
3. **Martian Mono** carries measured values. The parent publishes none.
4. **The contrast floor.** The parent leans on translucent text that lands near
   4:1. This site does not, because someone reports a hedgehog outdoors on a
   phone in daylight.

Anything else that diverges from the parent should be treated as drift and
brought back.

## Component rules

- Every interactive target is at least 44 × 44 px. This is a hard product
  constraint, not a guideline.
- Buttons come from the shared primitive (`src/components/ui/Button.tsx`).
  Hand-rolled `rounded-… bg-… px-…` in a page file is a defect.
- A custom-styled radio or checkbox must show focus on the **visible** element
  via `has-[:focus-visible]`. An `sr-only` input whose focus ring lands on an
  invisible element is an accessibility bug, and was one in the incumbent
  `ObservationTypeStep`.
- Selection state is shown by border, ground and an explicit check mark — never
  by colour alone.
- Alerts state the problem and the recovery, and carry an icon.
- Form fields come from `Field`, which wires label, hint and error to the
  control with real `id` / `aria-describedby` / `aria-invalid` links.

## Prohibitions

Checked against this system's own materials, not against taste:

- No dense dashboard grids or nested cards on public pages.
- No tracked uppercase eyebrow over every section.
- No hero stat row of big number over small label as a page's opening move.
- No coordinate, grid or monospaced decoration where a layperson needs a plain
  explanation.
- No gradient text; emphasis is weight and size.
- No glass or blur as decoration.
- No coloured `border-left` thicker than 1px on cards, list items or alerts.
- No raw Tailwind palette colours. No hex values outside `globals.css`, except
  the three map constants that MapLibre requires as literals, which are
  commented and must match the brand values.

## Motion

One authored moment per surface, not scattered hover effects: the step content
settling in as the transport advances (`.step-in`). Exponential ease-out from an
already-visible default state — content is never hidden waiting for an
animation. Every transition respects `prefers-reduced-motion`, including the
global `scroll-behavior: smooth`, which the incumbent applied unguarded.

## Data honesty

Demonstration figures are visibly demonstration figures — dashed outline in the
interface itself, not only a footnote. Unvalidated records never render in the
same treatment as validated ones. The public map draws the 500 m grid cell
rather than a point, because `public_location` is a grid cell; the interface
makes that visible instead of explaining it in small print.
