# AI Prompt Context â€” Website Builder Project

> **Copy-paste this document (or relevant sections) into every AI conversation to keep outputs consistent across the entire development lifecycle.**
> **For colors, theming, and visual design tokens, refer to the separate Style Guide file.**

---

## How to Use This Document

1. **Starting a new AI chat?** Paste the [Core Context](#core-context) section at minimum.
2. **Working on the editor?** Also paste [Editor Architecture](#editor-architecture) and [Section & Block System](#section--block-system).
3. **Working on the backend?** Also paste [Backend Architecture](#backend-architecture).
4. **Building a section or block component?** Also paste [Block Component Contract](#block-component-contract).
5. **Writing API endpoints?** Also paste [API Conventions](#api-conventions).
6. **Styling anything?** Also paste [Styling Rules](#styling-rules) + the **Style Guide** file.
7. **Planning AI features?** See [AI Integration (Parked)](#ai-integration-parked) â€” do NOT implement yet.

---

## Core Context

```
PROJECT: No-code website/landing page builder
PROJECT NAME: AppSite Builder (ASB)
TYPE: Full-stack web application
STACK: MERN (MongoDB, Express.js, React, Node.js)
LANGUAGE: TypeScript (strict mode, both frontend and backend)

TARGET USERS: Non-technical users (small business owners, freelancers, marketers)
COMPARABLE PRODUCTS: Carrd, Squarespace, early Wix â€” NOT Webflow or WordPress

CORE PHILOSOPHY:
- Section-based editor with composable blocks â€” NOT freeform drag-and-drop
- Sections define overall containers; groups define per-zone layout structure inside sections
- Users pick a section preset (or a blank section) → manage groups → then edit/add/remove blocks within group slots
- Simple, friendly controls â€” NEVER expose CSS properties, layers, or code
- Every page is a vertical stack of sections
- Users edit content through a right sidebar and inline text editing
- Dark-themed, modern editor UI with a premium feel
- Looks beautiful by default â€” zero design skill required
- AI features are planned but NOT built until the editor is stable (see Parked section)

ARCHITECTURE MODEL:
- Section = full-width container with section style + vertically stacked groups
- Group = sub-container inside a section with its own layout template and blocks
- Block = individual content piece (heading, text, button, image, etc.)
- Layout Template = defines how blocks are arranged in a group (spans[], alignment, reversed)
- Groups contain blocks placed into named slots defined by the chosen layout
- Users can add/remove/reorder blocks within a section â€” not just edit fixed fields
- This replaces the old rigid "variant with hardcoded props" model

CURRENT PHASE: MVP (10-12 week build)
MVP SCOPE: Auth, dashboard, template gallery, block-based editor (preset-driven sections + blank option),
           image upload, basic SEO, publish to free subdomain

EDITOR ROUTES — TWO DISTINCT MODES:
1. `/editor` — PUBLIC GUEST SANDBOX (no auth required)
   - Intended for unauthenticated users to explore and try the editor freely
   - State is persisted in localStorage only (no backend entity, no user account)
   - Changes are NOT saved to any server; data is lost if localStorage is cleared
   - No Publish, no project ownership, no dashboard link
   - Acts as a feature demo / try-before-you-sign-up experience
2. `/editor/:templateId` — AUTHENTICATED TEMPLATE EDITOR
   - Requires auth; editing is backed by a real TemplateProject document in MongoDB
   - State is auto-saved to the server (debounced 3 s) AND mirrored to localStorage
   - localStorage here is a write-through cache only — MongoDB is the source of truth
   - Ctrl+S triggers an immediate server save (bypasses the debounce)

STYLE REFERENCE: See the separate Style Guide (.md) for all colors, theming,
                 and visual design tokens. Do NOT hardcode colors â€” always
                 reference the style guide's design tokens / CSS variables.
```

---

## Tech Stack (Locked In)

### Frontend

```
Build Tool:         Vite
Framework:          React 18+ with TypeScript
Routing:            React Router v7 (react-router-dom)
Styling:            Tailwind CSS v4 (utility-first, no custom CSS files)
UI Components:      shadcn/ui (copy-pasted, not installed as dependency)
                    Radix UI primitives (@radix-ui/react-*)
Icons:              Google Material Symbols (Outlined) â€” NOT Lucide
State (Editor):     Zustand with Immer middleware
State (Server):     TanStack Query v5 (@tanstack/react-query)
Drag-and-Drop:      @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/modifiers
Inline Text Edit:   Tiptap (@tiptap/react, @tiptap/starter-kit, extensions)
Color Picker:       react-colorful (2KB, in Radix Popover)
Animations:         Framer Motion
Forms:              React Hook Form + Zod + @hookform/resolvers
Toasts:             Sonner
IDs:                nanoid (short unique IDs for sections and blocks)
Utilities:          lodash (debounce, cloneDeep), date-fns
```

### Backend

```
Server:             Express.js with TypeScript
Database:           MongoDB with Mongoose ODM
Auth:               JWT (access + refresh tokens) + bcryptjs + Passport.js
                    Strategies: passport-local, passport-google-oauth20
Validation:         Zod (shared schemas with frontend)
File Upload:        Multer â†’ Cloudinary (multer-storage-cloudinary)
Image Processing:   Sharp
Publishing:         ReactDOMServer.renderToStaticMarkup() â†’ sanitize-html â†’ html-minifier-terser
Email:              Nodemailer (MVP), Resend (post-MVP)
Logging:            Pino + pino-pretty
Error Tracking:     Sentry (@sentry/node)
Security:           Helmet, CORS, express-rate-limit, hpp
Utilities:          slugify, nanoid, node-cron
```

### Infrastructure

```
Frontend Hosting:   Vercel
Backend Hosting:    Railway or Render
Database:           MongoDB Atlas (free tier)
Image CDN:          Cloudinary (free tier)
DNS/CDN:            Cloudflare (wildcard DNS for *.builder.app)
SSL:                Cloudflare (auto) or Caddy (auto Let's Encrypt)
CI/CD:              GitHub Actions
```

---

## Editor Architecture

### Three-Panel Layout

The editor has a **LEFT sidebar (sections list) + CENTER canvas + RIGHT sidebar (settings)**:

```
â”Œâ”€ TOOLBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â˜° Page Name â–¾           ðŸ–¥ ðŸ“±         â†© â†ª       ðŸ‘ Preview   ðŸš€ Publish  â”‚
â”‚                                                   Last saved: 2 min ago   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  LEFT SIDEBARâ”‚           CANVAS                    â”‚    RIGHT SIDEBAR      â”‚
â”‚  (Sections   â”‚   (scrollable, centered,            â”‚    (Context-sensitive â”‚
â”‚   List)      â”‚    dark background)                  â”‚     settings panel)  â”‚
â”‚              â”‚                                      â”‚                      â”‚
â”‚  Page        â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”€â”€â”€ Section Mode â”€â”€ â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚   â”‚  â­ Hero Section (badge)      â”‚  â”‚   Layout:           â”‚
â”‚  â˜° Navbar    â”‚   â”‚                               â”‚  â”‚   [1-col][2-col]    â”‚
â”‚    Sticky Topâ”‚   â”‚  "Grow Your Business"  â†click â”‚  â”‚   [60-40][40-60]    â”‚
â”‚  â˜° Hero    â— â”‚   â”‚  "We help startups"           â”‚  â”‚                     â”‚
â”‚    2-Column  â”‚   â”‚       [Get Started]            â”‚  â”‚   Blocks:           â”‚
â”‚  â˜° Features  â”‚   â”‚              [hero.jpg]        â”‚  â”‚   â˜° Heading         â”‚
â”‚    3 Columns â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â˜° Text             â”‚
â”‚  â˜° CTA       â”‚                                      â”‚   â˜° Button           â”‚
â”‚    Banner    â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â˜° Image            â”‚
â”‚  â˜° Footer    â”‚   â”‚  Features Section             â”‚  â”‚   [+ Add Block]     â”‚
â”‚    Simple    â”‚   â”‚  âš¡ Fast  ðŸ›¡ Secure  â¤ Easy   â”‚  â”‚                     â”‚
â”‚              â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   Background         â”‚
â”‚  [âž• Add     â”‚                                      â”‚   [ðŸŽ¨][â–£][ðŸ–¼]       â”‚
â”‚   Section]   â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   Padding: [â”â”â—â”â”]  â”‚
â”‚              â”‚   â”‚        âž• Add Section          â”‚  â”‚                     â”‚
â”‚              â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”€â”€â”€ Block Mode â”€â”€â”€â”€ â”‚
â”‚              â”‚                                      â”‚  (when block clicked) â”‚
â”‚              â”‚         [ - 100% + ] (zoom)         â”‚   Heading: [___]     â”‚
â”‚              â”‚                                      â”‚   Size: [sm][md][lg] â”‚
â”‚              â”‚                                      â”‚   Align: [L][C][R]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
```

### Left Sidebar â€” Sections List Panel

- Displays all sections in page order as a **vertical list**
- Section rows show a compact single-line label with drag handle + section icon (no subtitle)
- Sections are **reorderable via drag** within this list (dnd-kit sortable)
- Focused section rows expand an inline **Groups** tree for that section
- Group rows are draggable to reorder groups within the focused section
- Group rows are single-line (no subtitle) and use branch indentation with connector lines to mirror a folder tree
- The **Add Group** action is indented under the section tree using the same branch connector style
- Clicking a row **selects** that section (highlights it on canvas + opens section settings in right sidebar) and auto-scrolls the canvas to keep the selected section in view.
- **"+ Add Section"** button at the bottom of the list
- The left sidebar is collapsible (hamburger icon in toolbar)

### Center Canvas

- Dark background with the page rendered in a centered, scrollable container
- Selected section has a **floating label badge** (e.g., "â­ Hero Section") at the top
- Sections are rendered as they will appear when published (WYSIWYG)
- Click a **block** on canvas -> selects that block (right sidebar switches to block settings)
- Selection outlines: selected group uses a **solid** focus border in Group Mode; when Block Mode is active, the owning group border becomes **dashed** while the selected block keeps its own focus border.
- Focused **flow** blocks can be dragged on the canvas across columns and between blocks; hover shows a horizontal insertion line at the exact drop position
- Group columns stretch to the full group row height so empty column space remains a valid drop zone while dragging
- Click **text blocks** on canvas â†’ **inline edit via Tiptap**
- **Zoom controls** at the bottom center: `[ - 100% + ]`
- Supports **device preview toggle** from toolbar (desktop/mobile width)

### Right Sidebar â€” Context-Sensitive Settings Panel

The right sidebar changes based on what is selected:

**When a SECTION is selected** (click section in left sidebar or section background on canvas):
1. **Section Actions** — duplicate/delete section.
2. **Layout** — section layout options:
   - **Fill screen height** toggle — makes the section fill the full viewport height (`min-height: 100vh`). User-facing label: "Fill screen height" / sub-label: "Section takes up the full screen". Implemented as a Radix Switch. Stored as `SectionStyle.fullHeight`.
   - **Group Alignment** buttons — top/center/bottom segmented icon buttons (same icon language as group alignment) that vertically align stacked groups inside the section's available height. Stored as `SectionStyle.groupVerticalAlign`.
3. **Background** — section background options (solid/gradient/image + overlay effect + padding slider).
   - A **Color Source** toggle (`Global Palette` | `Custom`) is shown for solid and gradient background types. Stored as `SectionStyle.colorMode`.
   - In `colorMode: "global"` (default), the section background is derived from the active global palette (`primaryColor`, `themeMode`, `colorScheme`) plus section index. No color pickers are shown.
   - In `colorMode: "custom"`, color pickers appear and the exact user-chosen color is used as-is — no light-mode transformation is applied to background colors. Text/accent colors are still adapted for light-mode readability.
   - When a user edits solid/gradient colors directly, `colorMode` is automatically promoted to `"custom"`. The user can switch back to `"global"` via the Color Source toggle.
   - `SectionModeSettings.handleBackgroundChange` respects explicit `colorMode` changes without auto-overriding them.
4. **Group Management Location** — groups are listed and reordered from the LEFT sidebar section tree.

**When a GROUP is selected** (click group container on the canvas or from the left sidebar section tree):
1. **Layout** — flexible picker for all groups (including navigation): segmented [1][2][3] column count tabs → distribution thumbnails (active matched by spans signature) → alignment buttons (top/center/bottom) → reversed On/Off toggle (multi-col only). Layout switching preserves flow block placement via per-layout slot memory; alignment and reversed are preserved across distribution changes within the same column count.
2. **Blocks** — ordered list of blocks within the selected group. Clicking **+ Add Block** opens a grouped block picker modal (category rail + search + block cards). Users select a block card, then click **Insert Block**; for multi-column layouts, they can choose the target column/slot before inserting.
3. **Group Style** — group-local spacing controls (top/bottom padding), surface preset (card/glass/bordered), corner radius, and block gap.
4. **Column Styling** — only visible when the group has 2 or 3 columns. A column selector (Col 1 / Col 2 / Col 3 tabs) lets the user pick which column to style independently. Controls:
   - **Preset** — dropdown select with built-in styles: **None** (clears all), **Card** (subtle light-gray border + sm shadow + padding), **Outlined** (border only), **Raised** (shadow only), **Frosted** (light background fill + border + sm shadow). All fields remain individually customizable after selecting a preset.
   - **Border** group: border color picker (hex), border width slider (0–8 px), border radius slider (0–32 px).
   - **Shadow** group: size buttons (None / S / M / L); shadow color picker (hex) shown only when a size is active.
   - **Background** group: background color picker (hex).
   - **Padding** group: horizontal padding slider (0–64 px), vertical padding slider (0–64 px).
   - All color pickers use `ColorControl` (react-colorful HexColorPicker + hex text input). Always store and display hex strings — never rgba/rgb strings.
   - Column styles are stored in `GroupStyle.columnStyles` as a `Record<number, ColumnStyle>` (0-based index). Applied per-slot in `GroupRenderer` via `getColumnContainerStyle()`.
   - Store action: `updateGroupColumnStyle(sectionId, groupId, colIndex, Partial<ColumnStyle>)`.

4. **Canvas Selection Border** - selected group uses a solid highlight border while Group Mode is active.

**When a BLOCK is selected** (click a specific block on the canvas):
1. **Block Content** - auto-generated controls based on block type (text input, image upload, etc.)
2. **Block Style** - constrained style options for that block (size, alignment, spacing, letter spacing, and per-block corners where supported). `heading`, `text`, `button`, `image`, `date`, and `countdown` blocks expose a **Font Family** control that opens the same Typography Settings modal used in Global Settings; selecting a font applies a block-level override (applied to the caption text for `image` blocks). `button` blocks also expose **Corner Style** (Sharp/S/M/L/Full) which defaults to the global corner style until explicitly overridden on that block.
3. **Position** - collapsible panel with:
   - **Column** — slot/column picker (shown only when the group layout has multiple slots and the block is in flow mode). Allows moving the block to a different column after it was added. Calls `moveBlockToSlot` / `moveBlockToSlotAtIndex` store actions.
   - **Flow / Absolute** toggle — choose positioning mode. Absolute blocks are positioned relative to the selected group and can be moved on the canvas by dragging.
4. **Block Actions** - header icons for duplicate/delete. Duplicate uses `duplicateBlock(sectionId, groupId, blockId)` and inserts a copy directly below the selected block (flow: same slot, next order; absolute: offset downward).
5. **Back to Group** - button to go back to group-level settings.
6. **Group Context Border** - while in Block Mode, the owning group's canvas border is dashed (not solid) to indicate parent context.
**When NOTHING is selected** (click empty canvas area):
- **Global Page Settings** - website theme mode (dark/light), font family (button opens a Typography Settings modal with search + preview cards + Apply Font action), primary color, color scheme, corner style. This remains the default font source for all text unless a supported block-level override is set. Typography options include sans, serif, and script families (for example: Inter, Playfair Display, Cormorant Garamond, EB Garamond, Cinzel, Great Vibes, Alex Brush, Allura, Parisienne, Sacramento).

### Toolbar

- **Left**: hamburger menu (collapse left sidebar) + template name (click-to-edit inline input — only active on `/editor/:templateId`; clicking the name swaps it for a borderless `border-b`-only input pre-filled with the current name; blur or Enter commits the rename via `useUpdateTemplateProject({ name })`; Escape cancels without saving; no-op if name is unchanged or empty)
- **Center**: device preview toggle (desktop/mobile icons) + undo/redo buttons
- **Right**: Keyboard Shortcuts button (opens shortcut list modal), Preview button (opens live preview in new tab), Publish button, save status indicator ("Saving..." spinner while server save is in-flight, "Last saved: X min ago" once confirmed, "Not saved yet" otherwise)
- **Debug Backdoor (params)**: when URL includes `?debug=true` (or `?debugMode=true`), toolbar shows **Import**/**Export** buttons for editor-state JSON roundtrip

### Key Behaviors

```
STATE MANAGEMENT:
- Zustand store (editorStore) holds: sections[], selectedSectionId,
  selectedGroupId, selectedBlockId, clipboard (Block | null), globalStyle, history[], future[], isDirty, isSaving, device, zoom
- Immer middleware for mutable-looking immutable updates
- TanStack Query handles all API calls (fetch project, auto-save, publish)
- Auto-save: debounced 3 seconds after any change
- Three selection levels: section-level, group-level, and block-level
- Editor routes: `/editor` (guest sandbox) and `/editor/:templateId` (authenticated template editing). Both render the same `EditorPage` component; `templateId` is read via `useParams<{ templateId?: string }>()`.
- Editor initialization: checks `useParams` and `location.state` on mount, priority order:
  1. `location.state.editorSeed === "blank"` → loads an empty canvas (no sections), saves to localStorage, clears navigation state
  2. `location.state.editorSeed === "basic"` → seeds `DEFAULT_SECTION_SEQUENCE` from scratch (ignoring localStorage), saves, clears state
  3. `useParams().templateId` (string, from `/editor/:templateId` URL) → fetches the template via `useGetTemplateProjectById(templateId)` (TanStack Query), loads the first page's sections + globalStyle into the store once data arrives, caches page metadata in `activeTemplateRef`; shows a loading indicator while fetching; deeplinkable and survives page refresh
  4. No seed / no templateId (guest `/editor`) → loads from localStorage; if no valid persisted state found, falls back to seeding `DEFAULT_SECTION_SEQUENCE`
- Template server auto-save (`/editor/:templateId` only): `activeTemplateRef` (a `useRef`) holds `{ templateId, pageMetadata }` after load. The 3 s debounced auto-save calls both `saveToLocalStorage()` (write-through cache) and `useUpdateTemplateProject` — sending `{ pages: [{ ...pageMetadata, sections }], globalStyle }` — to persist changes to MongoDB. On `onSuccess`, the mutation's returned `templateProject.updatedAt` is written to `editorStore.lastSaved` via `setLastSaved`, so the toolbar "Last saved" timestamp reflects server-confirmed save time (not localStorage time). `isPending` from `useUpdateTemplateProject` is synced to `editorStore.isSaving` via a `useEffect` in `EditorPage`, driving the toolbar "Saving..." spinner. `setIsSaving(value: boolean)` is the store action used for this.
- Guest auto-save (`/editor` only): debounced save writes to localStorage only. No server call is made. `activeTemplateRef` is null.
- `EDITOR_STORAGE_KEY` ("asb-editor-state") and `DEFAULT_GLOBAL_STYLE` are exported from `editorStore.ts`
- Editor state loading/import uses a single current schema; no backward migration paths are maintained
- Default section seeding is idempotent to prevent duplicate sections when effects re-run in development strict mode
- Default section preset backgrounds alternate between two dark tones to avoid adjacent sections using the same color on first load

DRAG-AND-DROP:
- Sections are reordered by dragging in the LEFT SIDEBAR list (not on the canvas)
- Groups are reordered by dragging in the LEFT SIDEBAR section tree (focused section only)
- Blocks within the selected group can be reordered in the RIGHT SIDEBAR block list
- Focused flow blocks can also be dragged directly on the CANVAS across columns and between blocks
- Canvas flow dragging shows a horizontal insertion line and commits precise slot/index placement on drop
- During canvas flow dragging, columns stretch to full group-row height so open space below blocks is a valid drop target
- Sections/groups/sidebar-list reordering uses @dnd-kit/sortable with vertical list strategy
- Drag handle (â˜° grip icon) on each row
- Tree drag collision targets are scoped by item type (section drags resolve only against sections, group drags only against groups) for reliable drop placement
- Active draggable rows are excluded from collision targets to avoid self-over detection and drop no-ops
- Group reorder commits by group IDs (active/over IDs) instead of transient indices to prevent snap-back in nested trees
- Canvas updates in real-time as items are reordered

BLOCK ADDING:
- Clicking **+ Add Block** opens a grouped block picker modal filtered by the section's `allowedBlockTypes` for the currently selected group
- The modal includes a category rail (**All / Basic / Media / Layout / Content**), grouped headings in the block grid, and a search input
- If the selected group layout has multiple slots (e.g., `left/right`, `col-1/col-2/col-3`), the modal shows a **Column** selector
- Users select a block card first, then click **Insert Block**; insertion calls `addBlock(sectionId, groupId, blockType, slot, options)`
- If no slot is provided, fallback behavior inserts into the first layout slot
- The modal supports **Add as absolute block**. Absolute blocks are created with group-relative coordinates in the selected group.

LAYOUT SWITCHING:
- Every layout change snapshots block slot/order for the current layout id
- Switching to a previously used layout restores that group layout's saved slot/order map per block
- First-time switches to a layout use deterministic slot-index mapping, then normalize order per slot
- Multi-column -> single-column keeps reading-order collapse; expanding back uses per-layout memory when available
- This prevents cumulative scrambling when repeatedly switching between 1/2/3-column layout combinations within the same group
- Navigation groups use the same slot model as other groups: `"main"` (1-col) or `"col-1"` / `"col-2"` / `"col-3"` (multi-column).
- No legacy navbar semantic-slot compatibility path is maintained (`brand`/`links`/`actions` are not used).

SELECTION (three levels):
- Selecting a section from the left sidebar auto-scrolls the canvas to that section when it is outside the current viewport
- Click a section row in left sidebar â†’ selects SECTION (right sidebar shows section actions + background)
- Click a block on the canvas â†’ selects BLOCK (right sidebar shows block content + block style)
- Click empty canvas area or press Escape â†’ deselects all â†’ right sidebar shows global settings
- Selecting a block also implicitly selects its parent section (shown highlighted on canvas)

KEYBOARD SHORTCUTS:
- Toolbar has a **Shortcuts** button that opens a modal with all available editor keyboard shortcuts
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + S: Save now — cancels pending debounce and saves immediately. On `/editor/:templateId`, also triggers an immediate server save via `useUpdateTemplateProject`. On guest `/editor`, saves to localStorage only.
- Ctrl/Cmd + C: Copy currently selected block to an in-memory clipboard (EditorState.clipboard). Ignored when focus is in a text input/textarea/contentEditable.
- Ctrl/Cmd + V: Paste copied block into the currently focused group/block target. Rules:
    - If a block is focused (selectedBlockId set): inserts the clone directly after the focused block in the same slot and selects the new block.
    - If only a group is focused (selectedGroupId set, no block): inserts the clone at the end of the group's first slot and selects the new block.
    - Clipboard persists across selections; paste can be repeated into different groups.
    - Ignored when focus is in a text input/textarea/contentEditable or when clipboard is empty.
    - Calls `copyBlock(sectionId, groupId, blockId)` and `pasteBlock(targetSectionId, targetGroupId, targetBlockId?)` store actions.
- Delete: Delete currently selected block, group, or section (deepest active selection)
- Esc: Deselect current block/section level

ABSOLUTE BLOCK POSITIONING:
- Blocks can be switched between `flow` and `absolute` modes from block settings
- Absolute blocks render in a group-relative layer (not viewport-relative)
- Dragging an absolute block on the canvas updates its `positionX` / `positionY`
- Absolute drag position updates are history-grouped with debounce so one drag is one undo/redo step
- Final pointer-up coordinates are committed before drag end so the last dropped position is undoable
- Absolute blocks keep a cached minimum width during drag so they do not auto-shrink near group/canvas edges
- During absolute dragging, canvas hover/pointer reactions and text selection are temporarily disabled to avoid accidental highlight states
- Layer order can be adjusted with block `zIndex`
- Absolute blocks can be resized with a `Scale` control (shrink/enlarge)
- Selected absolute blocks show an `Abs` marker in the canvas for quick identification
- Flow blocks continue to use layout slots and normal document flow

LIVE PREVIEW:
- Preview button opens `/editor/preview` in a new tab; when editing a template, opens `/editor/preview?templateId=<id>` instead
- Preview route (template mode): if `templateId` query param is present, fetches template data from the backend via `useGetTemplateProjectById` and renders the server-side page (sections + globalStyle); shows a loading state while fetching; "Back to Editor" link returns to `/editor/:templateId`
- Preview route (guest mode): if no `templateId`, reads from localStorage — loads saved sections/global style and listens for `StorageEvent` to refresh automatically as debounced auto-save runs
- Renders the page with `isEditing=false`; hidden sections remain hidden in preview

DEBUG BACKDOOR:
- Controlled by URL params: `debug` or `debugMode`
- Truthy values accepted: empty (`?debug`), `1`, `true`, `yes`, `on`
- `Export` downloads JSON payload with `{ version, exportedAt, state: { sections, globalStyle } }`
- `Import` accepts only `{ state: { sections, globalStyle } }` (same shape as export)
- Logic lives in `editor/EditorDebugBackdoor.tsx`; `EditorToolbar.tsx` only renders the debug action component

ZOOM:
- Zoom controls at bottom of canvas: minus button, percentage display, plus button
- Zoom range: 50% to 150% (default 100%)
- Affects canvas scale only, not sidebar panels

EDITOR DOES NOT HAVE (by design):
- Global freeform canvas with unrestricted layers and arbitrary parent containers
- Raw CSS property panels (no margin/padding/font-size inputs â€” constrained choices only)
- Layer tree or component tree
- Custom HTML/CSS/JS editing
- Section-level global absolute positioning
- Blocks cannot be nested inside other blocks
```

---

## Section & Block System

### Core Data Model

```typescript
// â”€â”€â”€ Block Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type BlockType =
  | "heading"        // H1-H4 text with size/weight/style options
  | "text"           // Body/paragraph text + optional iconLeft/iconRight
  | "button"         // CTA button — variant (solid/outline/ghost/link/text) + text + link + optional iconLeft/iconRight
  | "card"           // Surface card with title/body/button/image
  | "image"          // Single image — editableProps: src, alt, caption (short-text). editableStyles: width, opacity, height, fontSize (with custom), fontWeight, fontStyle, letterSpacing, textAlign (align-picker), captionVerticalAlign (top/center/bottom). Caption is full-width, absolutely positioned; horizontal alignment via textAlign, vertical via captionVerticalAlign. Supports block-level font family override applied to caption. supportsCustomTextSize = true (same as heading/text).
  | "icon"           // Material Symbol icon — plain icon only, no label
  | "spacer"         // Vertical space (height slider)
  | "badge"          // Small label/tag — variant (subtle/filled/outline/pill-dot) + text
  | "divider"        // Horizontal line
  | "list"           // Bulleted or numbered list of text items
  | "quote"          // Blockquote with attribution
  | "date"           // Event date/time display — editableProps: eventDate (date input) + eventTime (time input); editableStyles: width slider (320-1600px), section spacing slider (0-160px), and scale slider (25-300)
  | "countdown"      // Live countdown display — editableProps: eventDate (date input), eventTime (time input), showDays/showHours/showMinutes/showSeconds (toggle); editableStyles: scale slider (25-300). New countdown blocks prefill eventDate/eventTime from an existing date block when available.
  | "rsvp"           // Event RSVP form — full self-contained form with name, email, attendance toggle, guest count, song request, and submit button
  // Post-MVP:
  | "video"          // Embedded video (YouTube/Vimeo URL)
  | "form"           // Lead capture form
  | "social-links"   // Row of social media icons
  | "map";           // Embedded map

// â”€â”€â”€ Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Block {
  id: string;                     // nanoid(10)
  type: BlockType;
  slot: string;                   // Layout slot name ("main", "left", "right", "col-1", "col-2", "col-3")
  order: number;                  // Position within the slot (0-indexed)
  props: Record<string, any>;     // Content data (text, url, src, items[], etc.)
  style: BlockStyle;              // Constrained visual options
}

interface BlockStyle {
  // Text
  fontFamily?: string;            // Optional block-level font override (heading, text, button, image, date, countdown blocks)
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "custom";
  fontSizePx?: number;            // Custom heading/text size in px when fontSize="custom"
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  fontStyle?: "normal" | "italic";
  letterSpacing?: number;         // 0-12, slider (px, heading/text blocks)
  textAlign?: "left" | "center" | "right";
  textColor?: string;             // Custom text color (used when colorMode="custom")
  accentColor?: string;           // Custom accent/highlight color (used when colorMode="custom")
  colorMode?: "global" | "custom"; // "global" (default) follows GlobalStyle; "custom" uses textColor/accentColor above

  // Spacing
  marginTop?: number;             // 0-64, slider
  marginBottom?: number;          // 0-64, slider

  // Size (for images, icons, spacers)
  width?: "auto" | "sm" | "md" | "lg" | "full" | "custom";
  widthPx?: number;               // Custom divider width in px when width="custom"
  borderRadius?: "none" | "sm" | "md" | "lg" | "full"; // Button block corner override; falls back to GlobalStyle.borderRadius when unset
  dateSectionGap?: number;        // Date block only â€” vertical gap between top/middle/bottom sections
  height?: number;                // For spacers (8-128) and images (0-800, 0 = auto); slider

  // Appearance
  opacity?: number;               // 0-100 slider
  overlayEffect?: "none" | "dots" | "grid" | "dim" | "vignette"; // Image block only — CSS overlay pattern
  overlayIntensity?: number;      // 0-100; controls strength of image overlay (image block only)
  captionVerticalAlign?: "top" | "center" | "bottom"; // Image block only — vertical position of caption within image
  captionPadding?: number;        // Image block only — uniform padding (px) around caption text (default 16, slider 0-64)

  // Positioning (editor controls)
  positionMode?: "flow" | "absolute";
  positionX?: number;             // px from group container left
  positionY?: number;             // px from group container top
  zIndex?: number;                // Layer order for absolute blocks
  scale?: number;                 // Block scale percentage (date/countdown style slider; also used by absolute positioning)
}

// â”€â”€â”€ Layout Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface LayoutTemplate {
  id: string;                     // "1col", "2col-3-3", "3col-2-2-2", etc.
  label: string;                  // "Centered", "Split", "Wide Left", "Feature Center", etc.
  spans: number[];                // Column widths on a 6-unit grid — must sum to 6.
                                  // [6] = full-width, [3,3] = 50/50, [4,2] = 67/33, [1,4,1] = narrow-wide-narrow
  alignment: "top" | "center" | "bottom";
  reversed: boolean;              // When true, column order is visually reversed (CSS direction: rtl trick)
  slots: string[];                // ["main"] (1-col) | ["col-1","col-2",...] (multi)
}

// â”€â”€â”€ Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Group {
  id: string;                     // nanoid(10)
  label: string;                  // User-facing group label
  order: number;                  // Vertical stack order in section
  layout: LayoutTemplate;         // Defines the grid/flex structure for this group
  blocks: Block[];                // Flow + absolute blocks owned by this group
  style?: GroupStyle;             // Optional group-local spacing controls
}

interface ColumnStyle {
  preset?: "none" | "card";       // "card" applies card-like defaults; individual fields are always customizable
  borderColor?: string;           // Hex color for the column border
  borderWidth?: number;           // Border thickness in px (0–8)
  borderRadius?: number;          // Corner radius in px (0–32)
  shadowColor?: string;           // Hex color for the column drop shadow
  shadowSize?: "none" | "sm" | "md" | "lg";  // Shadow intensity
  backgroundColor?: string;      // Hex color for the column background fill
  paddingX?: number;              // Horizontal inner padding in px (0–64)
  paddingY?: number;              // Vertical inner padding in px (0–64)
}

interface GroupStyle {
  paddingTop?: number;            // Group inner top spacing (px)
  paddingBottom?: number;         // Group inner bottom spacing (px)
  maxWidth?: "content" | "wide" | "full";
  verticalAlign?: "top" | "center" | "bottom";
  surface?: "none" | "card" | "glass" | "bordered";  // Visual surface applied to the group container
  borderRadius?: "none" | "sm" | "md" | "lg";         // Corner radius when surface is active (default "md")
  gap?: "sm" | "md" | "lg" | "xl";                    // Spacing between blocks within each slot
  columnStyles?: Record<number, ColumnStyle>;          // Per-column styling, keyed by 0-based column index
}

interface Section {
  id: string;                     // nanoid(10)
  type: SectionType;              // Preset/profile key ("hero", "faq", "custom", etc.)
  label: string;                  // Editable section display name (defaults from preset)
  groups: Group[];                // Vertical stack of groups inside the section
  style: SectionStyle;            // Background, padding, colors
  isVisible: boolean;             // Toggle visibility without deleting
}

type SectionType =
  | "navbar" | "hero" | "features" | "cta"
  | "testimonials" | "faq" | "footer" | "custom"
  // Post-MVP:
  | "pricing" | "gallery" | "stats" | "logos"
  | "newsletter" | "contact" | "team";

interface SectionStyle {
  backgroundColor?: string;       // Hex color
  backgroundImage?: string;       // Cloudinary URL
  backgroundType?: "solid" | "gradient" | "image";
  gradientFrom?: string;          // Hex color (if gradient)
  gradientTo?: string;            // Hex color (if gradient)
  gradientDirection?: string;     // "to bottom" | "to right" | etc.
  paddingY?: number;              // Continuous value (px), controlled by slider
  backgroundEffect?: "none" | "dots" | "grid" | "overlay" | "dim" | "vignette";  // CSS overlay pattern layered via multiple backgrounds (`dim` kept as legacy alias)
  backgroundEffectIntensity?: number; // 0-100 strength for the selected backgroundEffect
  backgroundEffectColor?: string; // Hex color for "overlay" (defaults to #000000 for legacy dim behavior)
  fullHeight?: boolean;           // When true, section renders with min-height: 100vh (fills screen)
  groupVerticalAlign?: "top" | "center" | "bottom"; // Vertical alignment for stacked groups within section height
  colorMode?: "global" | "custom"; // "global" follows global palette tokens; "custom" uses section overrides
  textColor?: string;             // Optional section token override (used when colorMode="custom")
  accentColor?: string;           // Optional section token override (used when colorMode="custom")
}

// â”€â”€â”€ Global Style â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface GlobalStyle {
  fontFamily: string;             // Google Font name (e.g. "Inter", "Playfair Display", "Great Vibes", "Cormorant Garamond")
  primaryColor: string;           // Default accent color for all sections
  colorScheme: "monochromatic";   // Active global palette strategy (future: complementary, analogous, etc.)
  borderRadius: "none" | "sm" | "md" | "lg" | "full";  // Button/card corners
  themeMode: "dark" | "light";   // Applies website theme in editor canvas + preview
}

// â”€â”€â”€ Project â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;                   // URL subdomain: {slug}.builder.app
  status: "draft" | "published";
  pages: Page[];                  // Multi-page support (MVP: single page)
  globalStyle: GlobalStyle;
  seo: { title: string; description: string; ogImage: string };
  // Post-MVP AI context:
  // aiContext?: { businessName, industry, description, vibe, targetAudience }
  createdAt: string;
  updatedAt: string;
}

interface Page {
  id: string;
  name: string;                   // "Home", "About", etc.
  slug: string;                   // "/" for home, "/about", etc.
  sections: Section[];
  isDefault: boolean;             // MVP: always true (single page)
}
```

All sections, including navbar/navigation, use the same layout ID families and slot names: `"main"` (1-col) or `"col-1"` / `"col-2"` / `"col-3"` (multi-column).


### Layout Templates (pre-defined)

Layouts are pre-defined templates that control how blocks are spatially arranged within a group. Users pick via a **flexible column-count picker** — they never configure columns or grids directly. The picker shows: **[1][2][3] column count tabs** → **distribution thumbnails** (matched by spans signature, e.g. “3·3”, “4·2”) → **alignment (top/center/bottom)** → **reversed toggle** (multi-col only). This applies to all sections, including navbar. `reversed` is a per-group toggle — not a separate layout template.

```typescript
// All layouts use a 6-unit column grid. spans[] values must sum to 6.
// Rendering: gridTemplateColumns = spans.map(s => `${s}fr`).join(" ")
// Users pick via the flexible column-count picker — they never see numbers directly.
// `reversed` is a UI toggle (not a separate template) — picker preserves it across distribution switches.

const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // ─── 1 Column ──────────────────────────────────────────────────
  { id: "1col",       label: "Centered",     spans: [6], alignment: "center", reversed: false, slots: ["main"] },
  { id: "1col-left",  label: "Left Aligned", spans: [6], alignment: "top",    reversed: false, slots: ["main"] },

  // ─── 2 Columns (all distributions; reversed is a toggle, not a separate entry) ───
  { id: "2col-1-5", label: "Sidebar Left",  spans: [1, 5], alignment: "center", reversed: false, slots: ["col-1", "col-2"] },
  { id: "2col-2-4", label: "Wide Right",    spans: [2, 4], alignment: "center", reversed: false, slots: ["col-1", "col-2"] },
  { id: "2col-3-3", label: "Split",         spans: [3, 3], alignment: "center", reversed: false, slots: ["col-1", "col-2"] },
  { id: "2col-4-2", label: "Wide Left",     spans: [4, 2], alignment: "center", reversed: false, slots: ["col-1", "col-2"] },
  { id: "2col-5-1", label: "Sidebar Right", spans: [5, 1], alignment: "center", reversed: false, slots: ["col-1", "col-2"] },

  // ─── 3 Columns ─────────────────────────────────────────────────
  { id: "3col-1-1-4", label: "Wide Right",      spans: [1, 1, 4], alignment: "top", reversed: false, slots: ["col-1", "col-2", "col-3"] },
  { id: "3col-1-2-3", label: "Ascending",       spans: [1, 2, 3], alignment: "top", reversed: false, slots: ["col-1", "col-2", "col-3"] },
  { id: "3col-1-4-1", label: "Feature Center",  spans: [1, 4, 1], alignment: "top", reversed: false, slots: ["col-1", "col-2", "col-3"] },
  { id: "3col-2-2-2", label: "Equal",           spans: [2, 2, 2], alignment: "top", reversed: false, slots: ["col-1", "col-2", "col-3"] },
  { id: "3col-3-2-1", label: "Descending",      spans: [3, 2, 1], alignment: "top", reversed: false, slots: ["col-1", "col-2", "col-3"] },
  { id: "3col-4-1-1", label: "Wide Left",       spans: [4, 1, 1], alignment: "top", reversed: false, slots: ["col-1", "col-2", "col-3"] },
];
```

### Section Registry Pattern

Every section preset/profile is registered in a central `SECTION_REGISTRY` object. The registry now defines **default groups** (with legacy `defaultBlocks` compatibility):

```typescript
SECTION_REGISTRY[sectionType] = {
  renderer: React.ComponentType,          // The section shell renderer
  label: string,                          // "Hero", "Features", etc.
  icon: string,                           // Material Symbol icon name
  description: string,                    // For the "Add Section" modal
  allowedLayouts: string[],               // Legacy: no longer restricts the picker. Still used
                                          //   to resolve defaultLayoutId.
  defaultLayoutId: string,                // Which layout to use when section is first added
  defaultBlocks: Block[],                 // Legacy fallback: wrapped into one default group
  defaultStyle: SectionStyle,             // Default background/padding
  allowedBlockTypes: BlockType[],         // Which block types can be added to this section
  maxBlocksPerSlot?: number,              // Optional limit per slot
}
```

**How this differs from the old model:**
- Old: `variants[]` + `defaultProps` (fixed fields like `headline`, `buttonText`)
- New: `allowedLayouts[]` + `defaultGroups[]` (composable multi-zone content pieces)
- Old: Adding a "hero with two buttons" required a new variant
- New: User adds a second `button` block â€” no code changes needed
- Old: `editableProps[]` defined sidebar controls per section type
- New: Each block type has its own edit controls â€” sidebar auto-generates from block type

### Block Registry Pattern

Each block type defines its own controls and rendering:

```typescript
type BlockCategory = "basic" | "media" | "layout" | "content";

BLOCK_REGISTRY[blockType] = {
  component: React.ComponentType,          // Renders the block on canvas
  label: string,                           // "Heading", "Button", etc.
  icon: string,                            // Material Symbol name
  category: BlockCategory,                 // Grouping for Add Block modal sections
  defaultProps: Record<string, any>,       // Default content
  defaultStyle: BlockStyle,                // Default visual style
  editableProps: EditableField[],          // What controls to show in sidebar
  editableStyles: EditableStyleField[],    // What style controls to show (size, align, opacity — NOT textColor/accentColor)
  inlineEditable: boolean,                 // Can this block be edited inline on canvas?
  colorOptions?: { hasText: boolean; hasAccent: boolean }; // Controls which pickers appear in the Colors panel
}
// colorOptions drives the dedicated Colors panel in block-settings/ColorsPanel.tsx
// (wired by BlockSettings.tsx).
// hasText=true → shows Text Color picker; hasAccent=true → shows Accent Color picker.
// textColor and accentColor are NO LONGER in editableStyles — they are handled by the Colors panel.
```

### Block Component Contract

Every block component receives:

```typescript
interface BlockComponentProps {
  block: Block;                  // Full block data (type, props, style)
  sectionStyle: SectionStyle;    // Parent section's style (for color inheritance)
  globalStyle: GlobalStyle;      // Global page style
  isEditing: boolean;            // true in editor, false in preview/published
  isSelected: boolean;           // true when this block is the active selection
  onUpdateProp: (key: string, value: any) => void;
}
```

Rules for block components:
- Use `block.props.*` for content, `block.style.*` for visual options
- Inherit `sectionStyle.textColor` and `sectionStyle.accentColor` unless overridden by `block.style.*`
- Use global corner style by default (`globalStyle.borderRadius`), and allow `button` blocks to override with `block.style.borderRadius`
- Use inline `style={{}}` for dynamic values (colors, sizes)
- Use Tailwind classes for structural layout
- Support `isEditing` flag: disable links, show placeholder states when editing
- If `inlineEditable` is true, render a Tiptap wrapper for direct text editing on canvas
- Never import or read from the Zustand store directly â€” only use passed props

**Button block props (implemented):**
```typescript
// button block.props shape
{
  text: string;
  url: string;
  variant: "solid" | "outline" | "ghost" | "link" | "text";  // default: "solid"
  iconLeft?: string;   // Material Symbol name, set via icon-picker modal â€” empty string = no icon
  iconRight?: string;  // Material Symbol name, set via icon-picker modal â€” empty string = no icon
}
// variant drives className/style branching in ButtonBlock.tsx
// all variants except "text" inherit accentColor from sectionStyle (or globalStyle.primaryColor)
// block.style.borderRadius (if set) overrides globalStyle.borderRadius for solid/outline/ghost
// link/text variants do not render rounded corners
// iconLeft/iconRight use "icon-picker" control in editableProps; render as <span class="material-symbols-outlined"> inside the <a>
// icon size tracks block.style.fontSize: sm=16, base=18, lg=20, xl=22px
```

**Text block props (implemented):**
```typescript
// text block.props shape
{
  text: string;
  iconLeft?: string;   // Material Symbol name, set via icon-picker modal — empty string = no icon
  iconRight?: string;  // Material Symbol name, set via icon-picker modal — empty string = no icon
}
// iconLeft/iconRight use "icon-picker" controls in editableProps
// TextBlock.tsx renders icons before/after text using <span class="material-symbols-outlined">
// icon size follows text size presets: sm=16, base=18, lg=20, xl=22, 2xl=24, 3xl=28, 4xl=32, 5xl=36
// if fontSize="custom", icon size uses the same clamped px value as the text
```

**Heading block props (implemented):**
```typescript
// heading block.props shape
{
  text: string;
  textStyle?: "default" | "gradient";  // default: "default"
}
// "default" renders heading with inherited text color (sectionStyle.textColor or block.style.textColor)
// "gradient" renders text with CSS gradient: linear-gradient(135deg, accentColor, white/dark)
//   gradient endpoint: white (#ffffff) in dark mode, near-black (#111111) in light mode
//   accentColor comes from sectionStyle.accentColor or globalStyle.primaryColor
//   implemented via background-clip:text + color:transparent on the heading element
// text-wrap:balance (text-balance Tailwind class) is applied to ALL headings unconditionally
// textStyle uses "select" control type in editableProps (options: Default / Gradient)
// heading and text blocks support block.style.letterSpacing (0-12px slider in Block Mode)
```

**Badge block props (implemented):**
```typescript
// badge block.props shape
{
  text: string;
  variant?: "subtle" | "filled" | "outline" | "pill-dot";  // default: "subtle"
}
// "subtle"   → tinted accent background (accentColor + "18" alpha) + accent text — original style
// "filled"   → solid accent background + white text (#ffffff)
// "outline"  → transparent bg, 1px solid accent border + accent text
// "pill-dot" → tinted accent background (same as subtle) + accent text + small filled dot prefix
//              dot is a size-1.5 rounded-full span before the text, colored with accentColor
//              always renders with rounded-full regardless of globalStyle.borderRadius
// subtle/filled/outline respect globalStyle.borderRadius (never "rounded-none" — falls back to "rounded-md")
// variant uses "select" control type in editableProps
```

**Icon block props (implemented):**
```typescript
// icon block.props shape
{
  icon: string;          // Material Symbol name (e.g., "star", "bolt", "rocket_launch")
  displayStyle?: "plain" | "circle" | "square" | "rounded-square";  // default: "plain"
  bgOpacity?: "subtle" | "medium" | "strong";  // default: "medium" — only when displayStyle != "plain"
}
// No label — icon block renders the icon only (no caption/text below)
// colorOptions: { hasText: false, hasAccent: true } — only accent color is exposed in Block Mode color settings
// "plain" renders just the icon with no container background
// "circle" / "square" / "rounded-square" wrap the icon in an inline-flex div with:
//   - tinted background using accentColor via hexToRgba() helper in IconBlock.tsx
//   - bgOpacity maps to alpha: subtle=0.10, medium=0.18, strong=0.28
//   - border-radius: circle=50%, square=6px, rounded-square=~22% of icon size
//   - inner padding ~40% of icon size; container sized to keep square aspect ratio
// displayStyle uses "select" control; bgOpacity uses "select" control (NOT slider)
//   Reason: FieldRenderer only supports slider control type in editableStyles, not editableProps
// icon pixel size driven by block.style.fontSize: sm->24px, base->32px, xl->48px, 2xl->64px
```

**Divider block style controls (implemented):**
```typescript
// divider style controls in Block Mode
// width: size-picker options S/M/L/Full/Custom (maps to block.style.width)
// custom width uses the tune option and stores px value in block.style.widthPx
// custom width range: 40-1600px via slider + numeric input in Block Mode
// opacity: 0-100 slider (maps to block.style.opacity)
// renderer behavior in DividerBlock.tsx:
//   - width presets use percentage-based inline widths relative to the parent container:
//       "sm"   → width: 25%
//       "md"   → width: 50%
//       "lg"   → width: 75%
//       "full" → width: 100%
//   - all presets also set max-width: 100% to prevent overflow in narrow columns (e.g. group 3x3)
//   - custom width applies inline `width: ${block.style.widthPx}px` (clamped) + `max-width: 100%`
//   - line color comes from resolveTextColor(block.style, globalStyle)
//   - opacity applies as (block.style.opacity ?? 20) / 100
```

**RSVP block props (implemented):**
```typescript
// rsvp block.props shape
{
  nameLabel?: string;           // "Full Name" — field label (uppercase, accent color)
  namePlaceholder?: string;     // "Guest Name" — input placeholder
  emailLabel?: string;          // "Email Address"
  emailPlaceholder?: string;    // "email@example.com"
  attendanceLabel?: string;     // "Will You Be Attending?"
  acceptText?: string;          // "Joyfully Accept" — first toggle button text
  declineText?: string;         // "Regretfully Decline" — second toggle button text
  guestsLabel?: string;         // "Number of Guests"
  maxGuests?: string;           // "10" — max options in guest dropdown (select, values: "5"|"10"|"15"|"20")
  songLabel?: string;           // "Song Request"
  songPlaceholder?: string;     // "What song will get you on the dance floor?"
  submitText?: string;          // "Confirm Attendance" — submit button label
  submitUrl?: string;           // "#" — submit href (mailto: or external form URL)
  // Custom color overrides — empty string = use theme-aware default
  blockBgColor?: string;        // Block container background hex
  blockBorderColor?: string;    // Block container border hex
  inputBgColor?: string;        // Input/select/textarea background hex
  inputBorderColor?: string;    // Input/select/textarea border hex
  labelColor?: string;          // Field label color hex (defaults to accentColor)
  buttonBgColor?: string;       // Submit button background hex (defaults to accentColor)
  buttonTextColor?: string;     // Submit button text hex (defaults to black in dark mode)
}
// Color resolution: each color prop overrides only when non-empty; otherwise falls back to:
//   blockBg: dark="#0d1526", light="#f4f4f5"
//   blockBorder: dark="#1e2d4a", light="#e4e4e7"
//   inputBg: dark="#132040", light="#ffffff"
//   inputBorder: dark="#243656", light="#d4d4d8"
//   labelColor: resolveAccentColor (follows block.style.colorMode)
//   buttonBg: resolveAccentColor
//   buttonText: "#000000" (dark), "#ffffff" (light)
// Block layout: 2-column grid (Name/Email, Attendance toggle/Guest count) + full-width Song textarea
// Attendance: two toggle buttons (accept / decline) — interactive in preview, read-only in editor
// Guest dropdown: styled <select> with expand_more arrow icon
// Submit button: pill-shaped (borderRadius: 999px), uppercase, arrow_forward icon, full accentColor
// colorOptions: { hasText: true, hasAccent: true }
//   hasText=true → text color (form text, placeholders)
//   hasAccent=true → accent/primary color (label defaults, button defaults in global mode)
// editableStyles: marginTop, marginBottom
// inlineEditable: false
// category: "content"
```

### Section Renderer

The section renderer is responsible for:
1. Applying the section background style (color, gradient, image, padding)
2. Rendering groups in vertical order
3. Delegating each group's layout/slot rendering to a group renderer
4. Ensuring absolute blocks use group-local coordinate systems

```typescript
// Pseudocode for section/group rendering
function SectionRenderer({ section, isEditing, globalStyle }) {
  const groups = section.groups.sort((a, b) => a.order - b.order);

  return (
    <section style={applySectionStyle(section.style)}>
      {groups.map(group => (
        <GroupRenderer
          key={group.id}
          section={section}
          group={group}
          globalStyle={globalStyle}
          isEditing={isEditing}
        />
      ))}
    </section>
  );
}
```

### MVP Section Presets

Each section preset seeds a starting group/block composition. The section title is editable in Section Settings and is not fixed to the preset label.

| Preset | Default Layout | Default Blocks | Picker Layouts |
|------|---------------|----------------|----------------|
| blank (`custom`) | 1col | none (empty section with one group) | all standard |
| navbar | 3col-1-4-1 | `heading` (col-1), inline `list` (col-2), `button` (col-3) | all standard |
| hero | 2col-3-3 | `badge` + `heading` + `text` + `button` (col-1), `image` (col-2) | all standard (1-col, 2-col, 3-col) |
| features | 3col-2-2-2 | 3x (`icon` + `heading` + `text`) per col-1/col-2/col-3 | all standard |
| cta | 1col | `heading` + `text` + `button` | all standard |
| testimonials | 3col-2-2-2 | 3x `quote` per col-1/col-2/col-3 | all standard |
| faq | 1col | `heading` + Q&A pairs (`heading` + `text`) | all standard |
| footer | 3col-2-2-2 | `heading` + `list` (links) per col-1/col-2/col-3 | all standard |

> **Picker note:** All groups (including navbar) always show the full 5 × 2-col and 6 × 3-col distribution grid. `allowedLayouts` in sectionRegistry still exists but is no longer used to restrict the picker — it only drives `defaultLayoutId` resolution.

### Style Inheritance Chain

Styles cascade from global â†’ block (sections only control background, not text/accent colors):

```
GlobalStyle.primaryColor    -> default accent color for all blocks in "global" colorMode
GlobalStyle.colorScheme     -> resolves palette tokens (currently monochromatic)
GlobalStyle.fontFamily      â†’ default font for all text
GlobalStyle.borderRadius    â†’ default corner style for buttons and cards
GlobalStyle.themeMode       â†’ light/dark website rendering; drives default textColor in "global" mode
                              (dark â†’ #ffffff, light â†’ #111111)

SectionStyle.backgroundColor    -> section background (solid/gradient/image only — no text/accent on sections)
SectionStyle.groupVerticalAlign -> vertical alignment of stacked groups inside section height (top/center/bottom)

BlockStyle.colorMode        -> "global" (default): block derives text/accent from GlobalStyle
                               "custom": block uses its own textColor/accentColor
BlockStyle.textColor        â†’ custom text color (only active when colorMode="custom")
BlockStyle.accentColor      â†’ custom accent color (only active when colorMode="custom")
BlockStyle.fontFamily       â†’ optional block-level font override (heading, text, button, image, date, countdown blocks — applies to caption on image)
BlockStyle.fontSize         â†’ block-level size choice (heading/text support presets + "custom")
BlockStyle.fontSizePx       â†’ heading/text custom size in px (applies when fontSize="custom")
BlockStyle.fontWeight       â†’ block-level weight choice (where supported)
BlockStyle.fontStyle        â†’ block-level style choice ("normal" or "italic" for heading/text)
BlockStyle.letterSpacing    â†’ block-level letter spacing in px (heading/text only)
BlockStyle.textAlign        â†’ block-level alignment
BlockStyle.borderRadius     -> optional button corner override ("none" | "sm" | "md" | "lg" | "full"); falls back to GlobalStyle.borderRadius when unset
BlockStyle.width            -> block width preset ("auto" | "sm" | "md" | "lg" | "full" | "custom")
BlockStyle.widthPx          -> custom block width in px (used when width="custom", divider supports this)
BlockStyle.opacity          -> block opacity percentage (0-100)
BlockStyle.overlayEffect         -> image block overlay pattern ("none" | "dots" | "grid" | "dim" | "vignette")
BlockStyle.overlayIntensity      -> image block overlay strength (0-100)
BlockStyle.captionVerticalAlign  -> image block caption vertical position ("top" | "center" | "bottom")
BlockStyle.captionPadding        -> image block caption uniform padding in px (default 16, slider 0–64 step 4)
```

Color resolution (via `app/lib/blockColors.ts`):
- `resolveTextColor(style, globalStyle)` â†’ returns custom textColor if colorMode="custom", else theme default
- `resolveAccentColor(style, globalStyle)` â†’ returns custom accentColor if colorMode="custom", else globalStyle.primaryColor

---

## Sidebar Controls

### Right Sidebar — Section Mode

When a section is selected (not a specific group/block):

- Shows section-level actions (duplicate/delete)
- Shows **Layout** panel: Fill screen height toggle + Group Alignment buttons (top/center/bottom) for vertically stacked groups
- Shows **Background** panel: background type (solid/gradient/image), colors, effect, overlay color (for Overlay), effect intensity, paddingY
- **No text/accent color controls at section level** — colors are block-level only
- Code organization: `SettingsPanel.tsx` routes to dedicated mode components (`SectionModeSettings`, `GroupModeSettings`, `BlockSettings`, `GlobalSettingsPanel`)
- Group list and group reordering are handled in the LEFT sidebar section tree when a section is focused

Add Block modal behavior (in Group Mode):
- Shows block types allowed by the selected section profile (`custom`/blank allows all block types)
- Uses block categories from `BLOCK_REGISTRY[blockType].category` to group cards (Basic / Media / Layout / Content)
- Includes a category rail + search input + grouped block sections
- Uses selected group's `layout.slots` for the **Column** picker
- Requires selecting a block card and clicking **Insert Block** to confirm insertion
- Supports **Add as absolute block (group-relative)**

### Right Sidebar — Group Mode

When a group is selected:

- **Header actions** — **Back to Section** (`arrow_back`), **Duplicate** (`content_copy`), **Delete** (`delete`). Duplicate calls `duplicateGroup(sectionId, groupId)`; Delete calls `removeGroup(sectionId, groupId)`. These are context-aware in `SettingsPanel.tsx`: when `isGroupMode && activeGroup` is true the group-scoped actions fire; otherwise section-level actions (`duplicateSection` / `removeSection`) fire.
- **Layout** panel applies only to that group. Uses `updateGroupLayout(sectionId, groupId, layoutId)` for distribution/column-count changes and `updateGroupLayoutOptions(sectionId, groupId, { alignment?, reversed? })` for alignment and reversed without triggering slot migration.
- **Blocks** panel lists only blocks owned by that group
- **Group Style** panel controls group-local visual properties:
  - **Top/Bottom Padding** — continuous slider, adds spacing inside the group container
  - **Surface** — 4 options: None / Card / Glass / Bordered
    - Card: subtle fill (white/black alpha depending on themeMode) + thin border
    - Glass: frosted glass effect (backdrop-filter: blur + semi-transparent fill + border)
    - Bordered: border only, no fill
    - When surface is active, 24px inner padding is auto-added on all sides
  - **Corners** — shown only when surface is not "none": None / SM / MD / LG (border-radius: 0/8/12/16px)
  - **Block Gap** — spacing between blocks within each slot: None / S / M / L (0/4/12/24px)
### Right Sidebar — Block Mode

When a specific block is selected (click a block on the canvas):
- Header includes block actions: **Duplicate** (`content_copy`) and **Delete** (`delete`).
- `heading` and `text` block Size controls now include an icon-only **Custom Size** option (`tune`). When selected, Block Mode shows a px slider + numeric input (12-200px) and stores the value in `BlockStyle.fontSizePx`.
- `divider` Width control also includes an icon-only **Custom Width** option (`tune`). When selected, Block Mode shows a px slider + numeric input (40-1600px) and stores the value in `BlockStyle.widthPx` with `BlockStyle.width="custom"`.
- `image` blocks have an **Overlay** panel (rendered by `ImageOverlayPanel.tsx`) — 5 effect buttons (none/dots/grid/dim/vignette) plus an **Intensity** slider (0–100). The overlay is rendered as an absolutely positioned `<div>` layered over the `<img>` inside a `relative overflow-hidden` wrapper. State stored in `BlockStyle.overlayEffect` and `BlockStyle.overlayIntensity`.
- Block Mode UI is componentized under `app/editor/block-settings/` (header, per-panel components, and shared helpers/constants), while `BlockSettings.tsx` remains the store-wiring/orchestration layer.

```
â”Œâ”€ RIGHT SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â† Back to Group               â”‚  â† Returns to group mode
â”‚  Heading Block             [ðŸ—‘]  â”‚
â”‚                                   â”‚
â”‚  â–¼ Content                        â”‚  â† Auto-generated from block's editableProps
â”‚  Text:     [Build Faster._____]  â”‚
â”‚                                   â”‚
â”‚  â–¼ Style                          â”‚  â† Auto-generated from block's editableStyles
â”‚  Size:     [sm][base][lg][xl]    â”‚
â”‚  Weight:   [normal][bold]        â”‚
â”‚  Style:    [normal][italic]      â”‚
â”‚  Align:    [â† ][â†”][â†’ ]          â”‚
â”‚  Color:    [â— picker] (optional) â”‚
â”‚  Spacing â†• [â”â”â”â—â”â”â”]            â”‚
â”‚                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Available Control Types

```typescript
type ControlType =
  | "short-text"      // Single-line input (button text, titles, headings)
  | "long-text"       // Textarea (descriptions, paragraphs)
  | "date"            // Native date input (YYYY-MM-DD)
  | "time"            // Native time input (HH:mm, 24h)
  | "rich-text"       // Handled INLINE on canvas via Tiptap (not in sidebar)
  | "url"             // URL input with link icon validation
  | "image"           // Upload button + preview (Cloudinary)
  | "color"           // react-colorful HexColorPicker in Radix Popover
  | "slider"          // Continuous slider (Radix Slider) for padding, spacing, etc.
  | "background"      // Composite: type selector + color/gradient/image controls
  | "repeater"        // Add/remove/reorder list items with sub-fields
  | "icon-picker"     // Searchable Material Symbols modal — implemented via IconPickerControl.tsx
                      //   10 categories (~130 icons), search, category browse, remove option
                      //   Consecutive icon-picker fields in editableProps auto-render side-by-side
                      //   (grid grid-cols-2) via groupEditableFields() in editor/block-settings/utils.ts
  | "toggle"          // Radix Switch (boolean)
  | "select"          // shadcn Select dropdown (implemented in FieldRenderer; used by block prop/style option fields)
  | "size-picker"       // Segmented control for size choices (sm/md/lg/xl)
  | "align-picker"      // Segmented control for alignment (left/center/right)
  | "position-picker";  // 3×3 grid — values: "top-left" | "top-center" | "top-right" | "mid-left" | "mid-center" | "mid-right" | "bottom-left" | "bottom-center" | "bottom-right"
```

### Background Control (composite)

The Background section in the right sidebar is a **composite control** with:
1. **Type selector** — icon buttons in a row: Solid Color | Gradient | Image (| Video post-MVP)
2. **Color Source toggle** — shown for Solid and Gradient types (hidden for Image):
   - `Global Palette` (default): background color is derived from the active global palette + section index; no color pickers shown
   - `Custom`: color pickers appear; the user's exact selected color is used without any light-mode transformation
   - Stored as `SectionStyle.colorMode: “global” | “custom”`
   - Selecting a color automatically promotes to `”custom”`; clicking `Global Palette` resets to `”global”`
3. **Type-specific color controls** (shown only when `colorMode === “custom”`):
   - **Solid**: single color picker — falls back to scheme color as initial value if none saved
   - **Gradient**: two color pickers (“From” / “To”) + direction selector (shadcn Select, always visible for gradient type)
   - **Image**: URL input (always visible; not affected by Color Source toggle)
4. **Overlay Effect selector** — 5-button icon row: None | Dots | Grid | Overlay | Vignette
   - Implemented via `SectionStyle.backgroundEffect`
   - Rendered as CSS multiple background layers (no extra DOM elements, no z-index issues)
   - `none` â†' no overlay (default)
   - `dots` â†' `radial-gradient` dot pattern, 24px grid
   - `grid` â†' 1px line grid via two `linear-gradient` layers, 40px grid
   - `overlay` -> uniform color overlay via `linear-gradient`; color is user-selectable for contrast and style
   - `vignette` â†' radial darkening toward edges via `radial-gradient`, useful for drawing focus toward centered content
   - Colors adapt to `globalStyle.themeMode`: light dots/lines use dark rgba, dark uses white rgba
   - Effect layers stack on top of the background via CSS background-image chaining (effect layer first, bg layer second)
5. **Overlay Color picker** - shown when effect = `overlay`
   - Stored in `SectionStyle.backgroundEffectColor`
   - Defaults to `#000000`, matching the previous `dim` look
6. **Effect Intensity slider** â€” continuous Radix Slider (0-100) bound to `SectionStyle.backgroundEffectIntensity`
   - Applied to all non-`none` effects (`dots`, `grid`, `overlay`, `vignette`) to control overlay strength
7. **Y-axis padding slider** â€” continuous Radix Slider from Small (e.g., 20px) to Large (e.g., 160px)


- `list` blocks support an `Inline Row` toggle (useful for horizontal navigation links).
### Control Labels (User-Facing)

ALWAYS use friendly labels. NEVER expose technical terms:
- "Heading" â€” NOT "h1" or "fontSize"
- "Subheading" â€” NOT "subtitle" or "h2"
- "Button Text" â€” NOT "ctaLabel"
- "Button Link" â€” NOT "href" or "buttonUrl"
- "Image" with upload button â€” NOT "imageUrl" or "src"
- "Background" â€” NOT "backgroundColor"
- Padding slider labeled "Small / Large" â€” NOT "paddingY: 64px"
- Size picker labeled "Small / Medium / Large" â€” NOT "fontSize: 2xl"
- Alignment labeled with icons (â† â†” â†’) â€” NOT "textAlign: center"

---

## Left Sidebar â€” Sections List

```
â”Œâ”€ LEFT SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PAGE SECTIONS          [âŠ•]  â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚
â”‚  â˜° [â‰¡] Navbar     Sticky Topâ”‚  â† drag handle + icon + name + layout label
â”‚  â˜° [â˜…] Hero     â— 2-Column  â”‚  â† â— = active/selected indicator
â”‚  â˜° [â–¦] Features   3 Columns â”‚
â”‚  â˜° [â] Testimonials  Slider â”‚
â”‚  â˜° [â–¤] CTA          Banner  â”‚
â”‚  â˜° [â–£] Footer       Simple  â”‚
â”‚                               â”‚
â”‚  [+ Add Section]              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Each row in the left sidebar shows:
- **Drag handle** (â˜°) â€” for reordering via @dnd-kit/sortable
- **Section icon** â€” from the section registry
- **Section name** â€” editable section label stored on the section instance (defaults from preset, can be renamed)
- **Layout label** â€” the currently active layout (Centered, 2-Column, etc.)
- **Active indicator** â€” dot or highlight on the selected section
- **Hover actions** â€” visibility toggle, context menu (duplicate, delete)

Dragging happens **in this list**, not on the canvas. The canvas mirrors the order.

---

## Backend Architecture

### MongoDB Schemas

```
User:
  _id, name, email, passwordHash, avatar, provider, providerId,
  plan ("free"), createdAt, updatedAt

Project:
  _id, userId (refâ†’User), name, slug (unique, used as subdomain),
  status ("draft"|"published"),
  pages: [{
    id, name, slug, isDefault,
    sections: [{
      id, type,
      layout: { id, label, columns, distribution, alignment, direction, slots },
      blocks: [{ id, type, slot, order, props, style }],
      style: { backgroundColor, textColor, accentColor, colorMode, backgroundType, ... paddingY },
      isVisible
    }]
  }],
  globalStyle: { themeMode, fontFamily, primaryColor, colorScheme, borderRadius },
  seo: { title, description, ogImage },
  templateId (refâ†’Template), publishedUrl, publishedAt, publishedHtml,
  createdAt, updatedAt

Template:
  _id, name, category, description, thumbnail,
  createdById (ref→User),
  pages: [{ id, name, slug, isDefault, sections: [...] }],
  globalStyle: {...},
  seo: { tags: string[], summary?: string },
  isActive, isDeleted, usageCount, createdAt, updatedAt
  // category options: "Marketing" | "SaaS" | "Business" | "Personal" | "Retail" | "Content"

MediaAsset:
  _id, userId (refâ†’User), url, publicId, filename,
  size, width, height, format, createdAt
```

### API Conventions

```
Base URL:       /api
Auth header:    Authorization: Bearer <access_token>
Refresh token:  httpOnly cookie "refreshToken"
Validation:     Zod schemas (shared with frontend), validated via middleware
Errors:         { error: string, details?: object } with appropriate HTTP status
Pagination:     ?page=1&limit=20 â†’ { data: [], total, page, pages }

Route naming:   RESTful
  GET    /api/projects           â†’ list user's projects
  POST   /api/projects           â†’ create project
  GET    /api/projects/:id       â†’ get project (includes pages + sections + blocks)
  PUT    /api/projects/:id       â†’ save full project state (pages, sections, blocks, globalStyle)
  DELETE /api/projects/:id       â†’ delete project
  POST   /api/projects/:id/publish    â†’ render + deploy
  POST   /api/projects/:id/unpublish  â†’ take offline
  POST   /api/projects/:id/duplicate  â†’ clone project

Response shape (success):
  { data: {...}, message?: string }

Response shape (error):
  { error: "Description", details?: {...} }
```

### Publishing Pipeline

```
POST /api/projects/:id/publish
  1. Fetch project (pages + globalStyle + SEO) from MongoDB
  2. For each page, for each section:
     - Render groups in section.groups (vertical order)
       - Build each group layout grid from group.layout
       - For each block in each slot (and absolute blocks in group overlay):
       - Look up component from BLOCK_REGISTRY
       - Render block with its props + inherited section/global style
     - Wrap blocks in the section shell (background, padding)
  3. Wrap in HTML shell:
     - <!DOCTYPE html>, <head> with SEO meta, Tailwind CDN, Google Font
     - All rendered section HTML in <body>
  4. sanitize-html (XSS prevention)
  5. html-minifier-terser (minify)
  6. Save as static file â†’ serve via Nginx/Caddy
  7. Map to subdomain: {slug}.builder.app
  8. Update project status â†’ "published"
  9. Return { publishedUrl, publishedAt }
```

---

## Styling Rules

```
1. TAILWIND ONLY â€” no custom CSS files, no CSS modules, no styled-components
2. Use Tailwind utility classes for all layout and structural styling
3. Use inline style={{}} for dynamic values from section/block data:
   - style={{ backgroundColor: section.style.backgroundColor }}
   - style={{ color: section.style.textColor }}
   - style={{ paddingTop: section.style.paddingY, paddingBottom: section.style.paddingY }}
4. For editor shell colors/theming: reference the STYLE GUIDE file's design tokens
5. shadcn/ui components for dashboard/settings/auth UI
6. Radix UI primitives for editor controls (Popover, Select, Slider, Dialog, etc.)
7. Framer Motion for animations (section add/remove, drag, sidebar transitions)
8. Responsive: all sections must look good on mobile without user configuration
9. Section padding: paddingY is a continuous number value (in px),
   controlled by a Radix Slider, NOT discrete S/M/L/XL toggles
10. Border radius map (globalStyle.borderRadius):
    - "none" â†’ rounded-none
    - "sm"   â†’ rounded-md
    - "md"   â†’ rounded-lg
    - "lg"   â†’ rounded-xl
    - "full" â†’ rounded-full
    - Button blocks can override this with `block.style.borderRadius`; when unset, they use the global map above
11. Block fontSize map (block.style.fontSize):
    - "sm"   â†’ text-sm
    - "base" â†’ text-base
    - "lg"   â†’ text-lg
    - "xl"   â†’ text-xl
    - "2xl"  â†’ text-2xl
    - "3xl"  â†’ text-3xl
    - "4xl"  â†’ text-4xl
    - "5xl"  â†’ text-5xl
    - "custom" â†’ heading/text blocks, uses inline `fontSize: ${block.style.fontSizePx}px`
12. Block width map (block.style.width):
    - "auto" â†’ w-auto
    - "sm"   â†’ max-w-sm
    - "md"   â†’ max-w-md
    - "lg"   â†’ max-w-lg
    - "full" â†’ w-full
    - "custom" â†’ divider block uses inline `width: ${block.style.widthPx}px` (clamped) + `max-width: 100%`
```
    NOTE: DividerBlock does NOT use the Tailwind class map above. Divider width presets
    are percentage-based relative to the parent column: sm=25%, md=50%, lg=75%, full=100%,
    all with max-width: 100% to respect narrow group columns (e.g. 3x3 grid).

---

## File/Folder Structure

### Frontend

```
app/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/                      # shadcn/ui components
â”‚   â”œâ”€â”€ controls/                # Right sidebar control components
â”‚   â”‚   â”œâ”€â”€ ShortTextControl.tsx
â”‚   â”‚   â”œâ”€â”€ LongTextControl.tsx
â”‚   â”‚   â”œâ”€â”€ UrlControl.tsx
â”‚   â”‚   â”œâ”€â”€ ColorControl.tsx
â”‚   â”‚   â”œâ”€â”€ SliderControl.tsx
â”‚   â”‚   â”œâ”€â”€ BackgroundControl.tsx  # Composite: type + color/gradient/image + padding
â”‚   â”‚   â”œâ”€â”€ ImageControl.tsx
â”‚   â”‚   â”œâ”€â”€ RepeaterControl.tsx
â”‚   â”‚   â”œâ”€â”€ IconPickerControl.tsx      # Reusable icon picker modal (searchable Material Symbols grid)
â”‚   â”‚   â”œâ”€â”€ SizePickerControl.tsx
â”‚   â”‚   â”œâ”€â”€ AlignPickerControl.tsx
â”‚   â”‚   â”œâ”€â”€ FieldRenderer.tsx      # Control type switch
â”‚   â”‚   â””â”€â”€ ...
â”‚   â”œâ”€â”€ InlineText.tsx           # Tiptap inline editor wrapper
â”‚   â””â”€â”€ SortableItem.tsx         # dnd-kit sortable wrapper (used in sidebar lists)
â”‚
â”œâ”€â”€ blocks/                      # Block components (one per block type)
â”‚   â”œâ”€â”€ HeadingBlock.tsx
â”‚   â”œâ”€â”€ TextBlock.tsx
â”‚   â”œâ”€â”€ ButtonBlock.tsx
â”‚   â”œâ”€â”€ ImageBlock.tsx
â”‚   â”œâ”€â”€ IconBlock.tsx
â”‚   â”œâ”€â”€ SpacerBlock.tsx
â”‚   â”œâ”€â”€ BadgeBlock.tsx
â”‚   â”œâ”€â”€ DividerBlock.tsx
â”‚   â”œâ”€â”€ ListBlock.tsx
â”‚   â”œâ”€â”€ QuoteBlock.tsx
â”‚   â””â”€â”€ BlockRenderer.tsx        # Block type switch + renders correct component
â”‚
â”œâ”€â”€ sections/                    # Section shell renderers
â”‚   â”œâ”€â”€ SectionRenderer.tsx      # Section shell + grouped rendering
â”‚   â”œâ”€â”€ GroupRenderer.tsx        # Unified 6-unit grid renderer for all groups
â”‚   â””â”€â”€ FooterRenderer.tsx       # Optional special layout for footer
â”‚
â”œâ”€â”€ editor/
â”‚   â”œâ”€â”€ EditorPage.tsx           # Main three-panel layout
â”‚   â”œâ”€â”€ EditorCanvas.tsx         # Center: section rendering + zoom
â”‚   â”œâ”€â”€ EditorToolbar.tsx        # Top bar: name, device, undo/redo, preview, publish
â”‚   â”œâ”€â”€ SectionsListPanel.tsx    # LEFT sidebar: section tree + focused section groups (drag reorder)
â”‚   â”œâ”€â”€ SettingsPanel.tsx        # RIGHT sidebar orchestrator (mode router)
â”‚   â”œâ”€â”€ SectionModeSettings.tsx  # RIGHT sidebar: section mode content
â”‚   â”œâ”€â”€ GroupModeSettings.tsx    # RIGHT sidebar: group mode content
â”‚   â”œâ”€â”€ BlockSettings.tsx        # RIGHT sidebar: block mode orchestrator (composed panels)
â”‚   â”œâ”€â”€ GlobalSettingsPanel.tsx  # RIGHT sidebar: global page settings + Typography Settings modal trigger
â”‚   â”œâ”€â”€ SettingsCollapsibleSection.tsx # Shared settings collapsible UI
â”‚   â”œâ”€â”€ AddSectionModal.tsx      # Section preset picker dialog
â”‚   â”œâ”€â”€ AddBlockModal.tsx        # Grouped block picker modal (within a section)
â”‚   â”œâ”€â”€ sections-list/
â”‚   â”‚   â”œâ”€â”€ SectionTreeItem.tsx  # Section node renderer for left tree
â”‚   â”‚   â”œâ”€â”€ GroupTreeItem.tsx    # Group node renderer for left tree
â”‚   â”‚   â””â”€â”€ sectionTreeDnd.ts   # DnD id helpers/parsers for section-group tree
â”‚   â””â”€â”€ ...
â”‚
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ Dashboard.tsx
â”‚   â”œâ”€â”€ TemplateGallery.tsx
â”‚   â”œâ”€â”€ Login.tsx
â”‚   â”œâ”€â”€ Register.tsx
â”‚   â””â”€â”€ Settings.tsx
â”‚
â”œâ”€â”€ config/
â”‚   â”œâ”€â”€ sectionRegistry.ts      # Section preset/profile registry
â”‚   â”œâ”€â”€ blockRegistry.ts        # Block type registry
â”‚   â””â”€â”€ layoutTemplates.ts      # Pre-defined layout templates
â”‚
â”œâ”€â”€ stores/
â”‚   â””â”€â”€ editorStore.ts           # Zustand + Immer
â”‚
â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ useAutoSave.ts
â”‚   â”œâ”€â”€ useProject.ts
â”‚   â””â”€â”€ useTemplates.ts
â”‚
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ api.ts                   # API client
â”‚   â””â”€â”€ utils.ts                 # Helpers (cn, etc.)
â”‚
â”œâ”€â”€ types/
â”‚   â””â”€â”€ editor.ts                # All editor TypeScript interfaces
â”‚
â””â”€â”€ routes.ts / root.tsx
```

### Backend

```
server/src/
â”œâ”€â”€ config/         # db.ts, cloudinary.ts, passport.ts, env.ts
â”œâ”€â”€ models/         # User.ts, Project.ts, Template.ts, MediaAsset.ts
â”œâ”€â”€ routes/         # auth.ts, projects.ts, templates.ts, upload.ts
â”œâ”€â”€ controllers/    # authController.ts, projectController.ts, etc.
â”œâ”€â”€ middleware/      # auth.ts, validate.ts, upload.ts, errorHandler.ts
â”œâ”€â”€ services/       # publishService.ts, emailService.ts
â”œâ”€â”€ validators/     # Zod schemas (shared with frontend where possible)
â”œâ”€â”€ utils/          # logger.ts, generateSlug.ts, tokens.ts
â”œâ”€â”€ shared/         # blockRegistry.ts, sectionRegistry.ts (shared with frontend for SSR)
â”œâ”€â”€ app.ts          # Express setup
â””â”€â”€ server.ts       # Entry point
```

---

## Naming Conventions

```
FILES:
- React components:     PascalCase.tsx     (HeadingBlock.tsx, EditorCanvas.tsx)
- Hooks:                camelCase.ts       (useAutoSave.ts, useProject.ts)
- Stores:               camelCase.ts       (editorStore.ts)
- Utils/config:         camelCase.ts       (sectionRegistry.ts, blockRegistry.ts, api.ts)
- Types:                camelCase.ts       (editor.ts in types/)
- Backend routes:       camelCase.ts       (projects.ts, auth.ts)
- Backend models:       PascalCase.ts      (User.ts, Project.ts)

VARIABLES & FUNCTIONS:
- React components:     PascalCase         (function HeadingBlock())
- Hooks:                use* prefix        (useEditorStore, useAutoSave)
- Event handlers:       handle* prefix     (handleDragEnd, handlePublish, handleBlockClick)
- Boolean state:        is*/has* prefix    (isDirty, isEditing, hasImage, isBlockSelected)
- Constants:            UPPER_SNAKE        (SECTION_REGISTRY, BLOCK_REGISTRY, LAYOUT_TEMPLATES)
- Types/Interfaces:     PascalCase         (Section, Block, BlockStyle, GlobalStyle)
- Enums:                PascalCase         (SectionType, BlockType)
- API functions:        verb + noun        (getProject, saveProject, publishProject)
- Zod schemas:          camelCase + Schema (createProjectSchema, updateSectionsSchema)

MONGODB:
- Collections:          lowercase plural   (users, projects, templates, mediaassets)
- Fields:               camelCase          (userId, publishedUrl, createdAt)
- Indexes:              { field: 1 }       (ascending) or { field: -1 } (descending)

CSS/TAILWIND:
- No custom class names â€” use Tailwind utilities only
- Dynamic values via inline style={{}}
- Editor shell theming via design tokens from the Style Guide file
```

---

## Code Style Rules

```
GENERAL:
- TypeScript strict mode everywhere
- Prefer const over let, never use var
- Prefer arrow functions for non-component functions
- Use named exports (not default exports) for everything EXCEPT page components
- Destructure props and store values
- Keep components under 150 lines â€” extract sub-components when longer
- One component per file

REACT:
- Functional components only (no class components)
- Hooks at the top of the component
- Memoize expensive computations with useMemo
- Memoize callbacks passed to children with useCallback
- Use React.lazy for route-level code splitting
- Never put business logic in components â€” put it in the store or hooks

ZUSTAND:
- All editor state mutations go through the store (never setState in components)
- Use Immer middleware for nested updates
- Push to history stack before every mutation (for undo/redo)
- Debounce history pushes for rapid changes (typing, color dragging, slider dragging)
- Three selection states: selectedSectionId, selectedGroupId, and selectedBlockId

API CALLS:
- All API calls go through TanStack Query (useQuery, useMutation)
- Never use raw fetch/axios in components
- Centralize API functions in lib/api.ts
- Invalidate queries after mutations

ERROR HANDLING:
- Backend: try/catch in controllers, pass to next(error)
- Frontend: TanStack Query error states + toast notifications
- Never silently swallow errors
- Log errors with Pino (backend) and Sentry (both)
```

---

## Prompt Templates

### For Building a New Block Component

```
Context: I'm building a no-code website builder with a block composition system.
[Paste Core Context + Block Component Contract]

Task: Build the [BlockType]Block component.

Requirements:
- Follow the BlockComponentProps interface: { block, sectionStyle, globalStyle, isEditing, isSelected, onUpdateProp }
- Render the block's content from block.props
- Apply block.style (fontSize, fontWeight, fontStyle, letterSpacing, textAlign, etc.) via Tailwind class maps
- Inherit sectionStyle.textColor unless block.style.textColor is set
- If inlineEditable, wrap text in InlineText (Tiptap) component
- Support isEditing flag (disable links, show placeholder states)
- Include the block registry entry with defaultProps, defaultStyle, editableProps, editableStyles

The block should look polished by default. Refer to the Style Guide for theming.
```

### For Building a New Section Preset

```
Context: I'm building a no-code website builder with a block composition system.
[Paste Core Context + Section & Block System]

Task: Build the [SectionType] section preset.

Requirements:
- Define the section registry entry with:
  - allowedLayouts (which layout templates work for this section type)
  - defaultLayoutId (fallback layout when default group layout is not provided)
  - defaultGroups (pre-configured group(s) with layout + blocks; legacy defaultBlocks fallback allowed)
  - defaultStyle (background, padding, colors)
  - allowedBlockTypes (which blocks can be added to this section)
- The default groups/blocks should create a polished, professional-looking section
  with realistic placeholder content
```

### For Building a Backend Endpoint

```
Context: I'm building the backend for a no-code website builder.
[Paste Core Context + Backend Architecture]

Task: Build the [endpoint description] endpoint.

Requirements:
- Express.js route with TypeScript
- Zod validation on request body
- JWT auth middleware (req.user available)
- Mongoose for database operations
- Proper error handling (try/catch, next(error))
- Return shape: { data: {...} } or { error: "..." }
- Follow RESTful conventions
```

### For Building a Sidebar Control

```
Context: I'm building the editor right sidebar for a no-code website builder.
[Paste Core Context + Sidebar Controls]

Task: Build the [ControlType]Control component.

Requirements:
- Props: { label: string, value: any, onChange: (value) => void }
- Use Radix UI primitives where applicable
- Use Tailwind for styling, theming from the Style Guide file
- Compact design that fits in a ~320px wide sidebar
- Dark theme (reference the Style Guide for exact tokens)
- Friendly, non-technical appearance
- Accessible (keyboard navigable, proper ARIA)
```

### For Fixing a Bug

```
Context: I'm building a no-code website builder with this architecture:
[Paste Core Context + relevant architecture section]

Bug: [Describe the bug]

Current behavior: [What happens]
Expected behavior: [What should happen]

Relevant code: [Paste the code]

Please fix the bug while maintaining consistency with the project's
architecture and conventions.
```

---

## Key Decisions Log

These decisions are final. Don't revisit or suggest alternatives:

| Decision | Choice | Reason |
|----------|--------|--------|
| Editor paradigm | Section-based with block composition (NOT freeform) | Target users are non-technical; sections provide structure, blocks provide flexibility |
| Content model | Sections contain vertically stacked groups; groups contain blocks in layout slots | Supports mixed-layout sections without adding new variants |
| Layout system | 6-unit column grid — `spans[]` array drives `gridTemplateColumns` via `Nfr` units | Users pick via [1][2][3] column tabs + distribution thumbnails; never configure columns or CSS directly. `reversed` and `alignment` are separate toggle/button controls, not distinct layout templates. All groups (including navbar) share the same full distribution set. |
| Editor layout | Three panels: left (sections list) + center (canvas) + right (settings) | Matches reference design; separates navigation from editing |
| Selection model | Three levels: section-level, group-level, and block-level | Section for section style/actions, group for layout/blocks, block for content/style |
| Editor theme | Dark theme | Premium feel; matches reference design. Tokens in Style Guide file |
| Section reordering | Drag in the LEFT sidebar list (not on the canvas) | Cleaner UX; canvas stays WYSIWYG without drag handles cluttering |
| Block reordering | Drag in the RIGHT sidebar block list plus focused canvas drag (within selected group) | Sidebar keeps ordering explicit; canvas drag adds spatial placement with insertion-line feedback and cross-column drop |
| Page model | Vertical stack of sections, each with layout + blocks | Composable yet structured |
| Text editing | Inline on canvas (Tiptap) for text/heading blocks | More intuitive than editing in sidebar |
| Style inheritance | Global â†’ Section â†’ Block (cascade with overrides) | Consistent theming with per-block flexibility |
| Block styles | Constrained choices (sm/md/lg, not px values) | Prevents bad designs; feels simple |
| Padding control | Continuous slider (Small / Large) | More precise than discrete toggles; matches reference design |
| Background control | Composite (solid/gradient/image + color picker + padding slider) | Grouped logically; matches reference design |
| Data storage | JSON in MongoDB | Sections + blocks as nested documents; single read per page |
| State management | Zustand (NOT Redux/Context) | Simpler API, less boilerplate, perfect for editor state |
| Server state | TanStack Query (NOT Zustand) | Handles caching, refetching, mutations â€” don't mix with editor state |
| DnD library | @dnd-kit (NOT react-beautiful-dnd) | Better maintained, more flexible, accessible |
| CSS approach | Tailwind (NOT CSS modules/styled-components) | Utility-first matches section-based architecture perfectly |
| UI primitives | Radix UI (NOT Material UI/Ant Design) | Unstyled, accessible, composable â€” pairs with Tailwind |
| Icons | Google Material Symbols (NOT Lucide) | Consistent with style guide; larger icon set |
| Publishing output | Static HTML + Tailwind CDN | Simple, fast, no server runtime needed for published pages |
| AI features | Parked until editor is stable | See [AI Integration (Parked)](#ai-integration-parked) |

---

## MVP Scope Boundaries

### Build This (MVP)

- Email/password + Google OAuth signup/login
- User dashboard (project list)
- Template gallery (8-12 templates as section+block presets)
- Block-based editor with section presets (including blank) and 12 block types
- Three-panel editor: left sections list, center canvas, right settings
- Drag-to-reorder sections (left sidebar), groups (left sidebar tree), and blocks (right sidebar + focused canvas drag)
- Layout templates (1-col, 2-col, 3-col) with visual picker
- Block-level editing: content controls + constrained style options
- Inline text editing on canvas (Tiptap) for heading and text blocks
- Background controls (solid/gradient/image + padding slider)
- Image upload to Cloudinary
- Basic SEO (title, description, slug)
- Publish to free subdomain
- Undo/redo, auto-save, zoom controls
- Dark-themed editor UI

### Don't Build This (Yet)

- Multi-page websites (data model supports it, UI doesn't yet)
- Custom domains
- Forms / lead capture (form block is post-MVP)
- E-commerce / payments
- AI content generation (parked â€” see below)
- Real-time collaboration
- Version history
- Analytics integrations
- Blog / CMS
- Custom code injection
- Full admin panel (a basic admin templates route exists at `/admin/templates` for template management; anything beyond that is post-MVP)
  - `/admin/templates` row click navigates to `/editor/:templateId` — deeplinkable, survives refresh; the editor fetches template data via `useGetTemplateProjectById` using the URL param and saves changes back via `useUpdateTemplateProject`; new templates are created via `CreateTemplateModal` which navigates to `/editor` (no templateId) with `{ state: { editorSeed } }` instead
- Subscription billing (free-only for MVP)
- Mobile app
- Stock photo integration
- Password-protected pages
- Video block / video background type

---

## AI Integration (Parked)

> **STATUS: PARKED.** Do NOT implement any AI features until the editor is stable and the block composition system is fully working. This section documents the planned AI integration so the data model and architecture can accommodate it without breaking changes later.

### Why Parked

AI features depend on a stable, well-tested block system. If blocks change shape or the registry evolves, AI-generated content will break. Build the foundation first.

### Planned AI Features (Priority Order)

**Phase A: AI Copy Rewriter (lowest effort, highest perceived value)**
- Select any text or heading block â†’ "Rewrite" button appears
- Options: Make shorter, Make more persuasive, Change tone, Translate
- Implementation: Send block.props.text + context to Claude API â†’ return rewritten text
- No data model changes needed â€” just updates block.props.text

**Phase B: AI Full Page Generator (biggest acquisition feature)**
- User describes their business/page in natural language
- AI returns a complete page structure: sections + blocks + layout choices + styles
- Implementation: Structured output from Claude that matches the Project data model
- Requires: `aiContext` field on Project (businessName, industry, description, vibe, targetAudience)
- The AI output must conform to the exact Section/Block/Layout schema

**Phase C: AI Section Auto-Fill**
- User adds a new section â†’ AI pre-fills blocks with contextually relevant content
- Uses `aiContext` from the project to generate relevant copy
- Example: Add "Features" section to a dog walking site â†’ AI fills in "Daily Walks", "GPS Tracking", etc.

**Phase D: AI Style Advisor**
- User provides brand color or uploads logo â†’ AI suggests complete color palette + font pairing
- Returns a GlobalStyle + per-section style overrides
- Implementation: Color theory + Claude for font/vibe matching

**Phase E: AI Image Suggestions**
- When editing an image block, show "AI Suggest" option
- AI generates search queries based on page context â†’ Unsplash/Pexels API â†’ curated results
- Implementation: Unsplash API with AI-generated search terms

### Data Model Preparation

The Project model already supports AI integration without changes:
- `aiContext` can be added as an optional field on Project when needed
- Blocks have a standard shape that AI can generate directly
- Layout templates have string IDs that AI can reference
- Section presets define `allowedBlockTypes` which constrains AI output

### AI Output Contract (for future reference)

When AI generates content, it must return data conforming to this shape:

```typescript
interface AIGeneratedPage {
  globalStyle: GlobalStyle;
  sections: {
    type: SectionType;
    layoutId: string;                    // Must be a valid LayoutTemplate.id
    blocks: {
      type: BlockType;                   // Must be in the section's allowedBlockTypes
      slot: string;                      // Must be a valid slot in the chosen layout
      order: number;
      props: Record<string, any>;        // Must match the block type's expected props
    }[];
    style: Partial<SectionStyle>;
  }[];
  aiContext: {
    businessName: string;
    industry: string;
    description: string;
    vibe: string;
    targetAudience: string;
  };
}
```

This contract ensures AI output can be validated and loaded directly into the editor store.

---

## Glossary

| Term | Definition |
|------|-----------|
| **Section** | A full-width container with section style and vertically stacked groups. The top-level building unit of a page. |
| **Group** | A sub-container inside a section with its own layout and block list. Groups are stacked vertically. |
| **Block** | An individual content piece within a group (heading, text, button, image, icon, etc.). The atomic unit of content. |
| **Block Type** | The kind of content a block represents (heading, text, button, image, etc.). Determines what controls appear in the sidebar. |
| **Layout Template** | A pre-defined spatial arrangement for blocks within a group. Defined by `spans[]` (6-unit grid), `alignment`, and `reversed`. Users pick from visual thumbnails — never configure numbers directly. |
| **Slot** | A named position within a layout template where blocks are placed ("main", "left", "right", "col-1", etc.). |
| **Section Registry** | Central config mapping section profiles/presets to allowed layouts, default groups/default blocks fallback, and constraints. |
| **Section Label** | Editable display name saved on each section instance. Starts from preset label but is user-controlled in Section Settings. |
| **Block Registry** | Central config mapping block types to components, default props/styles, and editable fields. |
| **Block Style** | Constrained visual options for a block (fontFamily override, fontSize, optional heading/text `fontSizePx` for custom size, fontWeight, fontStyle, letterSpacing, textAlign, optional button `borderRadius` override, width, optional `widthPx` for custom divider width, opacity, spacing, positioning mode, scale). Never raw CSS. |
| **Section Style** | Design data for a section (backgroundColor/backgroundType/gradient fields, backgroundEffect, backgroundEffectIntensity, backgroundEffectColor, paddingY, fullHeight, groupVerticalAlign). |
| **Global Style** | Page-wide design settings (themeMode, fontFamily, primaryColor, colorScheme, borderRadius). `fontFamily` is the default text font across the page and can be overridden by supported blocks. |
| **Style Inheritance** | The cascade: Global â†’ Section â†’ Block. Each level can override the parent. |
| **Canvas** | The center panel where sections and blocks are rendered WYSIWYG. |
| **Left Sidebar / Sections List** | The left panel showing section tree navigation: reorderable sections plus focused-section groups with drag reorder. |
| **Right Sidebar / Settings Panel** | The right panel showing context-sensitive controls (section mode, group mode, block mode, or global settings). |
| **Section Mode** | Right sidebar state when a section is selected: shows section actions plus section layout/background controls. |
| **Group Mode** | Right sidebar state when a group is selected: shows group layout, blocks list, and group style controls. |
| **Block Mode** | Right sidebar state when a block is selected: shows block content and style controls. |
| **InlineText** | The Tiptap-based component that makes text directly editable on the canvas. Used by heading and text blocks. |
| **Control** | A right sidebar input component (ColorControl, SliderControl, SizePickerControl, etc.). |
| **FieldRenderer** | The switch component that renders the correct control based on field type. |
| **Background Control** | Composite control: type selector (solid/gradient/image) + picker + overlay effect + overlay color + effect intensity + padding slider. |
| **Preset** | A starter section blueprint (layout + groups + blocks + style) used by Add Section. Presets seed data; sections are still fully editable. |
| **Slug** | URL-friendly project name used as the subdomain (my-landing-page.builder.app). |
| **Publishing** | Rendering sections and blocks to static HTML and deploying to a subdomain. |
| **Template** | A pre-configured set of sections with blocks and styles, used as a starting point for a new project. |
| **Style Guide** | Separate file containing all color tokens, theme values, and visual design specs for the editor UI. |

---

*Document Version: 3.76 - Added new `countdown` block. `BlockType` now includes `"countdown"`. New block component `CountdownBlock.tsx` renders a live countdown using `eventDate` + `eventTime`, supports per-unit toggles (`showDays`, `showHours`, `showMinutes`, `showSeconds`), and supports block-scale control via `editableStyles.scale` (25–300, step 5). `blockRegistry.ts` now includes the `countdown` entry and `sectionRegistry.ts` allowed block lists now include `countdown` across section profiles. `BlockSettings.tsx` and `StylePanel.tsx` now include `countdown` in block-level Font Family override support. New countdown blocks prefill date/time from an existing `date` block in the current group/section when available (`editorStore.ts` addBlock flow).*
*Document Version: 3.75 - Added block-level Corner Style control for `button` blocks. `blockRegistry.ts` now exposes `borderRadius` options (Sharp/S/M/L/Full) in Button Block Style. `ButtonBlock.tsx` now resolves corner radius as `block.style.borderRadius ?? globalStyle.borderRadius`, so button-level corner choices override global settings while unset buttons continue inheriting global corners.*
*Document Version: 3.74 - Added left/right icon support to `text` blocks. `blockRegistry.ts` text entry now includes `defaultProps.iconLeft` and `defaultProps.iconRight` (empty-string defaults) plus two `icon-picker` fields in `editableProps` (`Left Icon`, `Right Icon`). `TextBlock.tsx` now renders Material Symbols before/after the text and scales icon size with the block font size (including custom px size).*
*Document Version: 3.73 - Replaced section `Dim` overlay with a colorable `Overlay` effect in `BackgroundControl`. Added `SectionStyle.backgroundEffectColor` and updated `SectionRenderer` so legacy `backgroundEffect: "dim"` still renders as the same black overlay by default.*
*Document Version: 3.72 - Added block-level Font Family selector support to `date` block. `BlockSettings.tsx` and `StylePanel.tsx` updated `supportsFontOverride` to include `block.type === "date"`, so date blocks can override `globalStyle.fontFamily` using the same Typography Settings modal as heading/text/button/image blocks.*
*Document Version: 3.71 - Added vertical section spacing control to `date` block. `blockRegistry.ts` date entry now includes `defaultStyle.dateSectionGap = 24` and a Section Spacing slider (`dateSectionGap`, 0–160, step 2). `DateBlock.tsx` now applies this value as the gap between the weekday, center row, and year sections (scale-aware), so users can tighten or expand vertical spacing.*
*Document Version: 3.70 - Added width control to `date` block. `blockRegistry.ts` date entry now includes `defaultStyle.widthPx = 920` and a Width slider (`widthPx`, 320–1600, step 10). `DateBlock.tsx` now applies `style.maxWidth` from `block.style.widthPx`, allowing the month/time parallel lines to shrink instead of always stretching full width.*
*Document Version: 3.69 - Updated `date` block day-number blur treatment to use the block's selected text color as the blur/halo source (not global accent), ensuring the duplicated blurred background always matches the block color choice.*
*Document Version: 3.68 - Replaced `date` block day-number neon shadow with a duplicated blurred background treatment. `DateBlock.tsx` now renders layered blurred clones and a soft radial halo behind the foreground day number, creating a richer cinematic depth effect while still honoring theme mode and scale.*
*Document Version: 3.67 - Increased neon glow intensity for the `date` block day number. `DateBlock.tsx` now uses stronger alpha values, wider blur radii, and an additional outer glow layer for a brighter, more pronounced neon effect while retaining theme-aware and scale-aware behavior.*
*Document Version: 3.66 - Added neon glow styling to the `date` block day number. `DateBlock.tsx` now derives glow color from block accent/global primary (via `resolveAccentColor`) and applies a layered `textShadow` on the large day value, with theme-aware intensity and scale-aware blur sizing.*
*Document Version: 3.65 - Added whole-block scale control for `date` block. `blockRegistry.ts` date entry now includes `defaultStyle.scale = 100` and editableStyles `scale` slider (25–300, step 5). `DateBlock.tsx` now applies this scale in flow mode by multiplying internal typography and spacing sizes, so the block resizes as a whole in normal group flow. Absolute mode keeps using the existing Position panel scale behavior.*
*Document Version: 3.64 - Added new `date` block (timeline-style event date display). `BlockType` now includes `"date"`. New block component `DateBlock.tsx` renders weekday/month/day/time/year layout from props. `blockRegistry.ts` adds the `date` entry with editable props `eventDate` and `eventTime` and defaults (`2024-08-08`, `15:00`). `ControlType` now includes `"date"` and `"time"` with new `DateControl.tsx` and `TimeControl.tsx`, wired in `FieldRenderer.tsx`. `sectionRegistry.ts` allowed block lists were updated to include `date` across section profiles.*
*Document Version: 3.63 - Added block copy/paste via Ctrl/Cmd+C and Ctrl/Cmd+V. `EditorState` extended with `clipboard: Block | null` (initialised to `null`). Two new store actions added to `editorStore.ts` and `EditorActions` interface: `copyBlock(sectionId, groupId, blockId)` — deep-copies the block into `state.clipboard`; `pasteBlock(targetSectionId, targetGroupId, targetBlockId?)` — clones the clipboard block with a fresh `nanoid(10)` id and inserts it after `targetBlockId` (same slot, next order) when a block is focused, or at the end of the group's first slot when only a group is focused. Clipboard persists across selections and paste can be repeated. Both shortcuts are skipped when focus is in a text input/textarea/contentEditable.*

*Document Version: 3.62 - Added captionPadding to image block. `BlockStyle.captionPadding` (number, default 16) controls uniform padding around the caption container via inline style. `blockRegistry.ts` adds a "Text Padding" slider (0–64, step 4) to image editableStyles. `ImageBlock.tsx` replaces hardcoded `px-4 py-3` with dynamic `style={{ padding: s.captionPadding ?? 16 }}`.*
*Document Version: 3.61 - Upgraded image block caption styling to match heading block. `BlockStyle` extended with `captionVerticalAlign` ("top"|"center"|"bottom"). `constants.ts` adds `image: 20` to `CUSTOM_TEXT_SIZE_DEFAULT_BY_BLOCK`. `StylePanel.tsx` adds `image` to `supportsCustomTextSize`. `blockRegistry.ts` image entry now has full editableStyles: fontSize (with custom), fontWeight, fontStyle, letterSpacing, textAlign (align-picker), captionVerticalAlign (size-picker Top/Mid/Bot). `textPosition` prop removed; horizontal alignment uses shared `BlockStyle.textAlign`, vertical uses new `captionVerticalAlign`. Caption container is full-width (`inset-x-0 w-full`). `ImageBlock.tsx` rewrote caption rendering with all style maps matching HeadingBlock.*
*Document Version: 3.60 - Added block-level font family override to `image` block. `ImageBlock.tsx` now applies `s.fontFamily || globalStyle.fontFamily` as inline `fontFamily` on the caption `<p>`. `BlockSettings.tsx` and `StylePanel.tsx` updated `supportsFontOverride` to include `block.type === "image"`, exposing the Font Family picker in the Style panel for image blocks.*
*Document Version: 3.59 - Added caption text overlay to `image` block. `ImageBlock.tsx` renders an absolutely-positioned `<p>` over the image at one of 9 grid positions. New props: `caption` (short-text) and `textPosition` (position-picker, default "mid-center"). New `ControlType` `"position-picker"` added to `editor.ts` and `FieldRenderer.tsx` — renders a 3×3 dot grid. `blockRegistry.ts` image entry updated with the two new `editableProps` and `defaultProps`.*
*Document Version: 3.59 - Added overlay effect + intensity slider to `image` block via `ImageOverlayPanel.tsx`. `BlockStyle` extended with `overlayEffect` ("none"|"dots"|"grid"|"dim"|"vignette") and `overlayIntensity` (0-100). `BlockSettings.tsx` conditionally renders `ImageOverlayPanel` for image blocks between Spacing and Position panels.*
*Document Version: 3.58 - Added "text" variant to button block. ButtonBlock now supports a plain-text style (no background, border, or underline) via a new "text" case in `getVariantConfig`. All button variants now include `cursor-pointer`. `blockRegistry.ts` adds the "Text" option to the button variant select.*
*Document Version: 3.58 - Added block-level font override to `button` block. `ButtonBlock.tsx` now applies `s.fontFamily || globalStyle.fontFamily` as an inline `fontFamily` on the `<a>` element. `BlockSettings.tsx` and `StylePanel.tsx` updated `supportsFontOverride` to include `block.type === "button"`, exposing the Font Family picker in the Style panel for button blocks the same way as `heading` and `text`.*
*Document Version: 3.57 - Fixed Group Mode delete action in `SettingsPanel.tsx`. The header Delete button now calls `removeGroup(sectionId, groupId)` when `isGroupMode && activeGroup` is true (previously always called `removeSection`, deleting the whole section). `removeGroup` is now imported from `editorStore`. Duplicate was already correct.*
*Document Version: 3.57 - Added `fontWeight` control to `text` block. `TextBlock.tsx` now includes a `FONT_WEIGHT_MAP` and applies `block.style.fontWeight` via Tailwind class (default: `"normal"`). `blockRegistry.ts` adds `fontWeight: "normal"` to `text` defaultStyle and a Weight size-picker (Normal/Medium/Bold) to `text` editableStyles, matching the existing `heading` block behavior.*
*Document Version: 3.56 - Removed `label` prop from `icon` block. IconBlock now renders a plain icon only — no caption/text below. Removed `label` from `icon` defaultProps and editableProps in blockRegistry. `colorOptions` for `icon` changed to `{ hasText: false, hasAccent: true }` — text color no longer exposed in Block Mode color settings; only accent color controls the icon.*
*Document Version: 3.56 - Fixed DividerBlock width to be relative to parent container. Width presets (S/M/L/Full) now use percentage-based inline styles (25%/50%/75%/100%) instead of absolute Tailwind max-w-* classes, ensuring dividers respect group column widths in multi-column layouts.*
*Document Version: 3.55 - Connected template creation to backend. CreateTemplateModal wired to useCreateTemplateProject (name, category, tags, description, blank/basic seed). EditorPage now reads editorSeed location state to initialize blank/basic canvas on template create. EDITOR_STORAGE_KEY and DEFAULT_GLOBAL_STYLE exported from editorStore. Updated Template schema (createdById, seo, isDeleted, updatedAt), admin templates route documented.*
*Document Version: 3.54 - Removed editor-state backward-compatibility paths. `editorStore` localStorage/debug import now expects only the current schema, with no legacy migration/normalization branches. `EditorDebugBackdoor` import accepts only `{ state: { sections, globalStyle } }` (export shape).*
*Document Version: 3.53 - Redesigned `AddSectionModal` into a preset picker (category rail + search + card selection + confirm footer), added a `custom` blank section preset, and moved section naming to instance-level state via editable `Section.label` in Section Mode settings. Section labels in canvas/sidebar/settings now resolve from `Section.label` instead of fixed registry labels.*
*Document Version: 3.52 - Updated Block Mode architecture notes after componentization: `BlockSettings.tsx` is now an orchestrator and Block Mode concerns are split under `app/editor/block-settings/` (header, content/style/colors/spacing/position panels, shared helpers/constants). Updated references to `groupEditableFields()` location in `editor/block-settings/utils.ts`.*
*Document Version: 3.51 - Added divider custom width controls. Divider Width now includes a `Custom` (`tune`) option that reveals a 40-1600px slider + numeric input in Block Mode, persisted as `BlockStyle.width="custom"` + `BlockStyle.widthPx`; `DividerBlock.tsx` renders this as a clamped inline width with `max-width: 100%`.*
*Document Version: 3.50 - Added divider block Width and Opacity controls in Block Mode. `divider` now exposes `block.style.width` (S/M/L/Full presets) and `block.style.opacity` (0-100 slider); `DividerBlock.tsx` applies width presets and renders opacity as `(opacity ?? 20) / 100` while preserving color-mode text color resolution. `BlockSettings.tsx` now falls back to `blockEntry.defaultStyle` for unset style keys so legacy blocks show correct default control states.*
*Document Version: 3.49 - Updated canvas selection-border semantics across settings modes: Group Mode shows a solid selected-group border, while Block Mode keeps the selected block focus and switches the owning group border to dashed for parent-context indication.*
*Document Version: 3.48 - Extended custom text sizing to `text` blocks. `heading` and `text` Size controls now both include the icon-only `tune` custom option; selecting it uses the same 12-200px slider + numeric input and applies inline `fontSize` from `BlockStyle.fontSizePx` when `fontSize="custom"` in `HeadingBlock.tsx` and `TextBlock.tsx`.*
*Document Version: 3.47 - Updated heading custom size affordance in Block Mode: the `Custom` size choice now renders as an icon-only button (`tune`) instead of text, while preserving the same `fontSize="custom"` + `fontSizePx` behavior and controls.*
*Document Version: 3.46 - Added heading custom text size support. `heading` block Size control now includes `Custom`; selecting it reveals a 12-200px slider plus numeric px input in Block Mode, persisted via `BlockStyle.fontSize="custom"` and `BlockStyle.fontSizePx`, and `HeadingBlock.tsx` applies the custom inline font size.*
*Document Version: 3.45 - Added editor debug backdoor actions behind URL params (`debug`/`debugMode`). Import/Export state UI moved out of `EditorToolbar.tsx` into `EditorDebugBackdoor.tsx` for separation of concerns; Export writes `{ version, exportedAt, state: { sections, globalStyle } }` (import shape was later tightened in v3.54).*
*Document Version: 3.44 - Added section-level vertical group alignment via `SectionStyle.groupVerticalAlign` (`"top" | "center" | "bottom"`). `SectionModeSettings` Layout panel now includes Group Alignment buttons (matching the group alignment icon set), and `SectionRenderer` applies this setting to vertically align stacked groups within the section's available height (especially when `fullHeight` is enabled).*
*Document Version: 3.43 - Added `BlockStyle.letterSpacing` for `heading` and `text` blocks. Block Mode now includes a Letter Spacing slider (0-12px), and both `HeadingBlock.tsx` and `TextBlock.tsx` apply it via inline styles.*
*Document Version: 3.42 - Added `BlockStyle.fontStyle` (`"normal" | "italic"`) and exposed a new Style control in Block Mode for `heading` and `text` blocks. `HeadingBlock.tsx` and `TextBlock.tsx` now apply block-level italic styling via `block.style.fontStyle`.*
*Document Version: 3.41 - Added block-level duplicate action in `BlockSettings.tsx` (`content_copy` icon). Duplicate now creates a copy directly below the selected block in the same group (`duplicateBlock` store action), with flow blocks inserted at the next slot order and absolute blocks offset downward.*
*Document Version: 3.40 - Expanded typography options with additional wedding-invitation-friendly families in the editor font picker and Google Fonts load list (`Alex Brush`, `Allura`, `Cinzel`, `Cormorant Garamond`, `EB Garamond`, `Great Vibes`, `Parisienne`, `Sacramento`).*
*Document Version: 3.39 - Added block-level font overrides for `heading` and `text` blocks. Block Mode now includes a Font Family control that opens the same Typography Settings modal used in Global Settings. `GlobalStyle.fontFamily` remains the default font; `BlockStyle.fontFamily` can override it per supported block.*
*Document Version: 3.38 - Added focused canvas drag for flow blocks inside groups: users can drag between columns and between blocks with a horizontal insertion line. Flow block drops now support precise slot/index placement (`moveBlockToSlotAtIndex`), and group columns stretch to full row height so empty column space remains a valid drop target.*
*Document Version: 3.37 - Replaced native editor dropdowns with shadcn `Select` components. `GlobalSettingsPanel` font family selection now uses a button-triggered **Typography Settings** modal (search + preview cards + explicit Apply Font action) instead of an inline dropdown. `BackgroundControl` gradient direction uses shadcn `Select`.*
*Document Version: 3.36 - Updated `SectionStyle.backgroundEffect` to remove `noise` and add `vignette`. `BackgroundControl` effect options are now None/Dots/Grid/Dim/Vignette. `SectionStyle.backgroundEffectIntensity` remains the shared 0-100 slider for all non-`none` effects (including `vignette`).*
*Document Version: 3.35 - Redesigned `AddBlockModal` to a grouped picker UX. Added category rail + search + grouped block cards + footer confirmation (`Insert Block`). Block registry entries now include `category: BlockCategory` (`basic | media | layout | content`) used by the modal for grouping.*
*Document Version: 3.34 - Added `dim` to `SectionStyle.backgroundEffect` and introduced `SectionStyle.backgroundEffectIntensity` (0-100) with `BackgroundControl` support.*
*Document Version: 3.33 - Added `SectionStyle.fullHeight` boolean. When true, the section renders with `min-height: 100vh`. Exposed in the right sidebar under a new "Layout" collapsible panel (above Background) as a Radix Switch labeled "Fill screen height" with sub-label "Section takes up the full screen". `SectionModeSettings` now has `layout` and `background` panels.*
*Document Version: 3.32 - Section background color pickers now use `globalStyle` as initial defaults. `BackgroundControl` accepts an optional `globalStyle` prop; solid color falls back to `globalStyle.primaryColor` (or theme-appropriate dark/light neutral), gradient "From" defaults to `globalStyle.primaryColor` and "To" to a neutral based on `themeMode`. `SectionModeSettings` reads `globalStyle` from store and passes it to `BackgroundControl`. Users can still set fully custom background colors — saved values always take precedence over these defaults.*
*Document Version: 3.31 - Moved color settings from section level to block level. Removed `textColor`, `accentColor`, `colorMode` from `SectionStyle`. Added `textColor`, `accentColor`, `colorMode` to `BlockStyle`. Each block now has a dedicated Colors panel (Global Palette / Custom) in the right sidebar. Added `colorOptions: { hasText, hasAccent }` to `BlockRegistryEntry` to control which color pickers are shown per block type. Added `app/lib/blockColors.ts` with `resolveTextColor` and `resolveAccentColor` helpers used by all block components.*
*Document Version: 3.57 - Added Global/Custom Color Source toggle to `BackgroundControl` for Solid and Gradient background types. `SectionStyle.colorMode` now controls whether the section uses the global palette (`"global"`) or the user's exact picked color (`"custom"`). Color pickers are only shown in `"custom"` mode. Fixed `SectionRenderer.getRenderSectionStyle` to no longer apply `lightenForLightMode` to custom background colors in light mode — custom colors are used exactly as chosen. Text/accent colors are still adapted for light-mode readability. `SectionModeSettings.handleBackgroundChange` now respects explicit `colorMode` changes without overriding them.*
*Document Version: 3.56 - `EditorToolbar` now accepts `templateName` and `onRenameTemplate` props from `EditorPage`. On `/editor/:templateId`, clicking the template name activates an inline `border-b`-only input; blur or Enter commits the rename via `useUpdateTemplateProject({ name })`; Escape cancels; noop if unchanged or empty. Guest `/editor` shows a static fallback name.*
*Last Updated: February 26, 2026*
*Keep this document updated as architecture decisions change.*
*For colors and theming, always reference the separate Style Guide file.*
















