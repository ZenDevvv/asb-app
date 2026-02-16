# AI Prompt Context — Website Builder Project

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
7. **Planning AI features?** See [AI Integration (Parked)](#ai-integration-parked) — do NOT implement yet.

---

## Core Context

```
PROJECT: No-code website/landing page builder
CODENAME: BuilderApp (placeholder — rename when you pick a brand)
TYPE: Full-stack web application
STACK: MERN (MongoDB, Express.js, React, Node.js)
LANGUAGE: TypeScript (strict mode, both frontend and backend)

TARGET USERS: Non-technical users (small business owners, freelancers, marketers)
COMPARABLE PRODUCTS: Carrd, Squarespace, early Wix — NOT Webflow or WordPress

CORE PHILOSOPHY:
- Section-based editor with composable blocks — NOT freeform drag-and-drop
- Sections define layout structure; blocks are the content pieces within slots
- Users pick a section type + layout → then edit/add/remove blocks within it
- Simple, friendly controls — NEVER expose CSS properties, layers, or code
- Every page is a vertical stack of sections
- Users edit content through a right sidebar and inline text editing
- Dark-themed, modern editor UI with a premium feel
- Looks beautiful by default — zero design skill required
- AI features are planned but NOT built until the editor is stable (see Parked section)

ARCHITECTURE MODEL:
- Section = full-width container with a layout template + background style
- Block = individual content piece (heading, text, button, image, etc.)
- Layout Template = defines how blocks are arranged (columns, distribution, alignment)
- Sections contain blocks placed into named slots defined by the layout
- Users can add/remove/reorder blocks within a section — not just edit fixed fields
- This replaces the old rigid "variant with hardcoded props" model

CURRENT PHASE: MVP (10-12 week build)
MVP SCOPE: Auth, dashboard, template gallery, block-based editor (7 section types),
           image upload, basic SEO, publish to free subdomain

STYLE REFERENCE: See the separate Style Guide (.md) for all colors, theming,
                 and visual design tokens. Do NOT hardcode colors — always
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
Icons:              Google Material Symbols (Outlined) — NOT Lucide
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
File Upload:        Multer → Cloudinary (multer-storage-cloudinary)
Image Processing:   Sharp
Publishing:         ReactDOMServer.renderToStaticMarkup() → sanitize-html → html-minifier-terser
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
┌─ TOOLBAR ──────────────────────────────────────────────────────────────────┐
│  ☰ Page Name ▾           🖥 📱         ↩ ↪       👁 Preview   🚀 Publish  │
│                                                   Last saved: 2 min ago   │
├──────────────┬─────────────────────────────────────┬───────────────────────┤
│  LEFT SIDEBAR│           CANVAS                    │    RIGHT SIDEBAR      │
│  (Sections   │   (scrollable, centered,            │    (Context-sensitive │
│   List)      │    dark background)                  │     settings panel)  │
│              │                                      │                      │
│  Page        │   ┌──────────────────────────────┐  │  ─── Section Mode ── │
│  ─────────── │   │  ⭐ Hero Section (badge)      │  │   Layout:           │
│  ☰ Navbar    │   │                               │  │   [1-col][2-col]    │
│    Sticky Top│   │  "Grow Your Business"  ←click │  │   [60-40][40-60]    │
│  ☰ Hero    ● │   │  "We help startups"           │  │                     │
│    2-Column  │   │       [Get Started]            │  │   Blocks:           │
│  ☰ Features  │   │              [hero.jpg]        │  │   ☰ Heading         │
│    3 Columns │   └──────────────────────────────┘  │   ☰ Text             │
│  ☰ CTA       │                                      │   ☰ Button           │
│    Banner    │   ┌──────────────────────────────┐  │   ☰ Image            │
│  ☰ Footer    │   │  Features Section             │  │   [+ Add Block]     │
│    Simple    │   │  ⚡ Fast  🛡 Secure  ❤ Easy   │  │                     │
│              │   └──────────────────────────────┘  │   Background         │
│  [➕ Add     │                                      │   [🎨][▣][🖼]       │
│   Section]   │   ┌──────────────────────────────┐  │   Padding: [━━●━━]  │
│              │   │        ➕ Add Section          │  │                     │
│              │   └──────────────────────────────┘  │  ─── Block Mode ──── │
│              │                                      │  (when block clicked) │
│              │         [ - 100% + ] (zoom)         │   Heading: [___]     │
│              │                                      │   Size: [sm][md][lg] │
│              │                                      │   Align: [L][C][R]  │
├──────────────┴─────────────────────────────────────┴───────────────────────┤
```

### Left Sidebar — Sections List Panel

- Displays all sections in page order as a **vertical list**
- Each row shows: **drag handle (☰)** + **section type icon** + **section name** + **layout label** + **active indicator**
- Sections are **reorderable via drag** within this list (dnd-kit sortable)
- Clicking a row **selects** that section (highlights it on canvas + opens section settings in right sidebar) and auto-scrolls the canvas to keep the selected section in view.
- **"+ Add Section"** button at the bottom of the list
- The left sidebar is collapsible (hamburger icon in toolbar)

### Center Canvas

- Dark background with the page rendered in a centered, scrollable container
- Selected section has a **floating label badge** (e.g., "⭐ Hero Section") at the top
- Sections are rendered as they will appear when published (WYSIWYG)
- Click a **block** on canvas → selects that block (right sidebar switches to block settings)
- Click **text blocks** on canvas → **inline edit via Tiptap**
- **Zoom controls** at the bottom center: `[ - 100% + ]`
- Supports **device preview toggle** from toolbar (desktop/mobile width)

### Right Sidebar — Context-Sensitive Settings Panel

The right sidebar changes based on what is selected:

**When a SECTION is selected** (click section in left sidebar or section background on canvas):
1. **Layout** � visual thumbnail grid of layout templates. Click to change column structure. Layout switching preserves block placement across layout combinations by using per-layout slot memory and deterministic slot mapping.
2. **Blocks** � ordered list of blocks within the section. Add/remove/reorder blocks. Clicking **+ Add Block** opens a modal of allowed block types; for multi-column layouts, users choose the target column/slot before inserting.
3. **Background** — section background options (solid/gradient/image + padding slider).

**When a BLOCK is selected** (click a specific block on the canvas):
1. **Block Content** - auto-generated controls based on block type (text input, image upload, etc.)
2. **Block Style** - constrained style options for that block (size, alignment, spacing).
3. **Position** - choose `flow` or `absolute`. Absolute blocks are positioned relative to the section and can be moved on the canvas by dragging.
4. **Back to Section** - button to go back to section-level settings.

**When NOTHING is selected** (click empty canvas area):
- **Global Page Settings** — font family, primary color, corner style.

### Toolbar

- **Left**: hamburger menu (collapse left sidebar) + page name (editable dropdown)
- **Center**: device preview toggle (desktop/mobile icons) + undo/redo buttons
- **Right**: Keyboard Shortcuts button (opens shortcut list modal), Preview button (opens live preview in new tab), Publish button, "Last saved: X min ago" timestamp

### Key Behaviors

```
STATE MANAGEMENT:
- Zustand store (editorStore) holds: sections[], selectedSectionId,
  selectedBlockId, globalStyle, history[], future[], isDirty, device, zoom
- Immer middleware for mutable-looking immutable updates
- TanStack Query handles all API calls (fetch project, auto-save, publish)
- Auto-save: debounced 3 seconds after any change
- Two selection levels: section-level and block-level

DRAG-AND-DROP:
- Sections are reordered by dragging in the LEFT SIDEBAR list (not on the canvas)
- Blocks within a section can be reordered in the RIGHT SIDEBAR block list
- Both use @dnd-kit/sortable with vertical list strategy
- Drag handle (☰ grip icon) on each row
- Canvas updates in real-time as items are reordered

BLOCK ADDING:
- Clicking **+ Add Block** opens a block picker modal filtered by the section's `allowedBlockTypes`
- If the current layout has multiple slots (e.g., `left/right`, `col-1/col-2/col-3`), the modal shows a **Column** selector
- New blocks are inserted into the selected slot with `addBlock(sectionId, blockType, slot)`
- If no slot is provided, fallback behavior inserts into the first layout slot
- The modal also supports **Add as absolute block**. Absolute blocks are created with section-relative coordinates.

LAYOUT SWITCHING:
- Every layout change snapshots block slot/order for the current layout id
- Switching to a previously used layout restores that layout's saved slot/order map per block
- First-time switches to a layout use deterministic slot-index mapping, then normalize order per slot
- Multi-column -> single-column keeps reading-order collapse; expanding back uses per-layout memory when available
- This prevents cumulative scrambling when repeatedly switching between 1/2/3-column layout combinations
- For legacy navbar sections (single-slot layouts), first switch to a nav layout smart-maps blocks by type (brand, links, actions).
- Navbar layout switching uses semantic slot mapping (`brand`/`links`/`actions`); when a slot is absent in the current layout, its blocks stay preserved and reappear when switching back.

SELECTION (two levels):
- Selecting a section from the left sidebar auto-scrolls the canvas to that section when it is outside the current viewport
- Click a section row in left sidebar → selects SECTION (right sidebar shows layout + blocks + background)
- Click a block on the canvas → selects BLOCK (right sidebar shows block content + block style)
- Click empty canvas area or press Escape → deselects all → right sidebar shows global settings
- Selecting a block also implicitly selects its parent section (shown highlighted on canvas)

KEYBOARD SHORTCUTS:
- Toolbar has a **Shortcuts** button that opens a modal with all available editor keyboard shortcuts
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + S: Save now
- Delete: Delete currently selected block or section
- Esc: Deselect current block/section level

ABSOLUTE BLOCK POSITIONING:
- Blocks can be switched between `flow` and `absolute` modes from block settings
- Absolute blocks render in a section-relative layer (not viewport-relative)
- Dragging an absolute block on the canvas updates its `positionX` / `positionY`
- Absolute drag position updates are history-grouped with debounce so one drag is one undo/redo step
- Final pointer-up coordinates are committed before drag end so the last dropped position is undoable
- Absolute blocks keep a cached minimum width during drag so they do not auto-shrink near section/canvas edges
- During absolute dragging, canvas hover/pointer reactions and text selection are temporarily disabled to avoid accidental highlight states
- Layer order can be adjusted with block `zIndex`
- Absolute blocks can be resized with a `Scale` control (shrink/enlarge)
- Selected absolute blocks show an `Abs` marker in the canvas for quick identification
- Flow blocks continue to use layout slots and normal document flow

LIVE PREVIEW:
- Preview button saves current editor state to localStorage before opening preview
- Opens `/editor/preview` in a new tab
- Preview route loads saved sections/global style and renders the page with `isEditing=false`
- Preview tab listens for editor localStorage updates and refreshes automatically as autosave runs
- Hidden sections remain hidden in preview

ZOOM:
- Zoom controls at bottom of canvas: minus button, percentage display, plus button
- Zoom range: 50% to 150% (default 100%)
- Affects canvas scale only, not sidebar panels

EDITOR DOES NOT HAVE (by design):
- Global freeform canvas with unrestricted layers and arbitrary parent containers
- Raw CSS property panels (no margin/padding/font-size inputs — constrained choices only)
- Layer tree or component tree
- Custom HTML/CSS/JS editing
- Viewport-level absolute positioning
- Blocks cannot be nested inside other blocks
```

---

## Section & Block System

### Core Data Model

```typescript
// ─── Block Types ────────────────────────────────────────────────────────

type BlockType =
  | "heading"        // H1-H4 text with size/weight options
  | "text"           // Body/paragraph text
  | "button"         // CTA button with text + link
  | "card"           // Surface card with title/body/button/image
  | "image"          // Single image with alt text
  | "icon"           // Material Symbol icon with optional label
  | "spacer"         // Vertical space (height slider)
  | "badge"          // Small label/tag (e.g., "NEW", "v2.0")
  | "divider"        // Horizontal line
  | "list"           // Bulleted or numbered list of text items
  | "quote"          // Blockquote with attribution
  // Post-MVP:
  | "video"          // Embedded video (YouTube/Vimeo URL)
  | "form"           // Lead capture form
  | "social-links"   // Row of social media icons
  | "map";           // Embedded map

// ─── Block ──────────────────────────────────────────────────────────────

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
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  textColor?: string;             // Hex override (inherits from section if empty)

  // Spacing
  marginTop?: number;             // 0-64, slider
  marginBottom?: number;          // 0-64, slider

  // Size (for images, icons, spacers)
  width?: "auto" | "sm" | "md" | "lg" | "full";
  height?: number;                // For spacers only, slider

  // Appearance
  opacity?: number;               // 0-100 slider

  // Positioning (editor controls)
  positionMode?: "flow" | "absolute";
  positionX?: number;             // px from section container left
  positionY?: number;             // px from section container top
  zIndex?: number;                // Layer order for absolute blocks
  scale?: number;                 // Absolute block scale percentage (default 100)
}

// ─── Layout Template ────────────────────────────────────────────────────

interface LayoutTemplate {
  id: string;                     // "1-col-center", "2-col-50-50", etc.
  label: string;                  // "Centered", "Split 50/50", etc.
  columns: 1 | 2 | 3;
  distribution: string;           // "100" | "50-50" | "60-40" | "40-60" | "33-33-33"
  alignment: "top" | "center" | "bottom";
  direction: "row" | "row-reverse";
  slots: string[];                // Ordered slot names: ["main"] or ["left", "right"]
  thumbnail?: string;             // Optional thumbnail for the layout picker
}

// ─── Section ────────────────────────────────────────────────────────────

interface Section {
  id: string;                     // nanoid(10)
  type: SectionType;              // "hero" | "features" | "cta" | etc.
  layout: LayoutTemplate;         // Defines the grid/flex structure
  blocks: Block[];                // Content blocks placed into layout slots
  style: SectionStyle;            // Background, padding, colors
  isVisible: boolean;             // Toggle visibility without deleting
}

type SectionType =
  | "navbar" | "hero" | "features" | "cta"
  | "testimonials" | "faq" | "footer"
  // Post-MVP:
  | "pricing" | "gallery" | "stats" | "logos"
  | "newsletter" | "contact" | "team";

interface SectionStyle {
  backgroundColor?: string;       // Hex color
  textColor?: string;             // Hex color (inherited by blocks unless overridden)
  accentColor?: string;           // Hex color for buttons/highlights
  backgroundImage?: string;       // Cloudinary URL
  backgroundType?: "solid" | "gradient" | "image";
  gradientFrom?: string;          // Hex color (if gradient)
  gradientTo?: string;            // Hex color (if gradient)
  gradientDirection?: string;     // "to bottom" | "to right" | etc.
  paddingY?: number;              // Continuous value (px), controlled by slider
}

// ─── Global Style ───────────────────────────────────────────────────────

interface GlobalStyle {
  fontFamily: string;             // Google Font name ("Inter", "Playfair Display")
  primaryColor: string;           // Default accent color for all sections
  borderRadius: "none" | "sm" | "md" | "lg" | "full";  // Button/card corners
}

// ─── Project ────────────────────────────────────────────────────────────

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

Navbar presets also include dedicated layout ids: `nav-brand-links`, `nav-brand-cta`, and `nav-brand-links-cta` with semantic slots (`brand`, `links`, `actions`).


### Layout Templates (pre-defined)

Layouts are pre-defined templates that control how blocks are spatially arranged within a section. Users pick a layout from a visual grid — they never configure columns or grids directly.

```typescript
const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // Single column
  {
    id: "1-col-center",
    label: "Centered",
    columns: 1,
    distribution: "100",
    alignment: "center",
    direction: "row",
    slots: ["main"],
  },
  {
    id: "1-col-left",
    label: "Left Aligned",
    columns: 1,
    distribution: "100",
    alignment: "top",
    direction: "row",
    slots: ["main"],
  },

  // Two columns
  {
    id: "2-col-50-50",
    label: "Split 50/50",
    columns: 2,
    distribution: "50-50",
    alignment: "center",
    direction: "row",
    slots: ["left", "right"],
  },
  {
    id: "2-col-60-40",
    label: "Content + Side",
    columns: 2,
    distribution: "60-40",
    alignment: "center",
    direction: "row",
    slots: ["left", "right"],
  },
  {
    id: "2-col-40-60",
    label: "Side + Content",
    columns: 2,
    distribution: "40-60",
    alignment: "center",
    direction: "row",
    slots: ["left", "right"],
  },
  {
    id: "2-col-50-50-reverse",
    label: "Split Reverse",
    columns: 2,
    distribution: "50-50",
    alignment: "center",
    direction: "row-reverse",
    slots: ["left", "right"],
  },

  // Three columns
  {
    id: "3-col-equal",
    label: "3 Columns",
    columns: 3,
    distribution: "33-33-33",
    alignment: "top",
    direction: "row",
    slots: ["col-1", "col-2", "col-3"],
  },
];
```

### Section Registry Pattern

Every section type is registered in a central `SECTION_REGISTRY` object. The registry now defines **default blocks** instead of fixed props:

```typescript
SECTION_REGISTRY[sectionType] = {
  renderer: React.ComponentType,          // The section shell renderer
  label: string,                          // "Hero", "Features", etc.
  icon: string,                           // Material Symbol icon name
  description: string,                    // For the "Add Section" modal
  allowedLayouts: string[],               // IDs of layout templates this section supports
  defaultLayoutId: string,                // Which layout to use when section is first added
  defaultBlocks: Block[],                 // Pre-configured blocks for a fresh section
  defaultStyle: SectionStyle,             // Default background/padding
  allowedBlockTypes: BlockType[],         // Which block types can be added to this section
  maxBlocksPerSlot?: number,              // Optional limit (e.g., navbar might limit to 1 per slot)
}
```

**How this differs from the old model:**
- Old: `variants[]` + `defaultProps` (fixed fields like `headline`, `buttonText`)
- New: `allowedLayouts[]` + `defaultBlocks[]` (composable content pieces)
- Old: Adding a "hero with two buttons" required a new variant
- New: User adds a second `button` block — no code changes needed
- Old: `editableProps[]` defined sidebar controls per section type
- New: Each block type has its own edit controls — sidebar auto-generates from block type

### Block Registry Pattern

Each block type defines its own controls and rendering:

```typescript
BLOCK_REGISTRY[blockType] = {
  component: React.ComponentType,          // Renders the block on canvas
  label: string,                           // "Heading", "Button", etc.
  icon: string,                            // Material Symbol name
  defaultProps: Record<string, any>,       // Default content
  defaultStyle: BlockStyle,                // Default visual style
  editableProps: EditableField[],          // What controls to show in sidebar
  editableStyles: EditableStyleField[],    // What style controls to show
  inlineEditable: boolean,                 // Can this block be edited inline on canvas?
}
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
- Use `globalStyle.borderRadius` for buttons and cards
- Use inline `style={{}}` for dynamic values (colors, sizes)
- Use Tailwind classes for structural layout
- Support `isEditing` flag: disable links, show placeholder states when editing
- If `inlineEditable` is true, render a Tiptap wrapper for direct text editing on canvas
- Never import or read from the Zustand store directly — only use passed props

### Section Renderer

The section renderer is responsible for:
1. Applying the section's background style (color, gradient, image, padding)
2. Rendering the layout template (columns, distribution, alignment)
3. Placing blocks into their assigned slots
4. Delegating to block components for actual content rendering

```typescript
// Pseudocode for section rendering
function SectionRenderer({ section, isEditing, globalStyle }) {
  const layout = section.layout;
  const blocksBySlot = groupBlocksBySlot(section.blocks);

  return (
    <section style={applySectionStyle(section.style)}>
      <div className={layoutToGridClasses(layout)}>
        {layout.slots.map(slotName => (
          <div key={slotName} className={slotClasses(layout, slotName)}>
            {blocksBySlot[slotName]?.map(block => (
              <BlockRenderer
                key={block.id}
                block={block}
                sectionStyle={section.style}
                globalStyle={globalStyle}
                isEditing={isEditing}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
```

### MVP Section Types

Each section type is a **preset** — a combination of a default layout + default blocks. Users start with the preset and can modify from there.

| Type | Default Layout | Default Blocks | Allowed Layouts |
|------|---------------|----------------|-----------------|
| navbar | nav-brand-links-cta | `heading` (brand), inline `list` (links), `button` (CTA) | nav-brand-links, nav-brand-cta, nav-brand-links-cta |
| hero | 2-col-50-50 | `badge` + `heading` + `text` + `button` (left slot), `image` (right slot) | All 1-col and 2-col |
| features | 3-col-equal | `heading` (above) + 3x (`icon` + `heading` + `text`) per column | 1-col, 2-col, 3-col |
| cta | 1-col-center | `heading` + `text` + `button` | All 1-col and 2-col |
| testimonials | 3-col-equal | 3x (`quote` + `text` (name/role)) per column | 1-col, 2-col, 3-col |
| faq | 1-col-center | `heading` + `list` (Q&A pairs, rendered as accordion) | 1-col only |
| footer | 3-col-equal | `heading` + `list` (links) per column + `divider` + `text` (copyright) | 1-col, 3-col |

### Style Inheritance Chain

Styles cascade from global → section → block:

```
GlobalStyle.primaryColor    → used as default accentColor for all sections
GlobalStyle.fontFamily      → applied to all text
GlobalStyle.borderRadius    → applied to buttons, cards, images

SectionStyle.textColor      → inherited by all blocks in the section
SectionStyle.accentColor    → inherited by buttons, icons, links in the section
SectionStyle.backgroundColor → section background

BlockStyle.textColor        → overrides section's textColor for this block only
BlockStyle.fontSize         → block-level size choice
BlockStyle.textAlign        → block-level alignment
```

---

## Sidebar Controls

### Right Sidebar — Section Mode

When a section is selected (not a specific block):

```
┌─ RIGHT SIDEBAR ──────────────────┐
│  Hero Section              [⋮]   │  ← section name + context menu (duplicate, delete)
│  SETTINGS                         │
│                                   │
│  ▼ Layout                         │  ← Visual thumbnail grid of allowed layouts
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ [==] │ │[= ][=]│ │[=][ =]│   │
│  │center│ │ 50/50 │ │ 60/40 │   │
│  └──────┘ └──────┘ └──────┘     │
│                                   │
│  ▼ Blocks                         │  ← Ordered list with drag reorder
│  ☰ Heading      "Build Faster"  │
│  ☰ Text         "Create stun…"  │
│  ☰ Button       "Start Free"    │
│  ☰ Image        hero.jpg         │
│  [+ Add Block]                   │
│                                   │
│  ▼ Background                     │  ← Section background + padding
│  Type: [🎨][▣][🖼]              │
│  Color:  [● picker]              │
│  Y Padding:                      │
│  Small [━━━━━━●━━━━━━] Large    │
│                                   │
└───────────────────────────────────┘
```

- Navigation layouts use nav-specific thumbnails (brand/logo, links row, CTA pill) instead of generic equal bars.
- For navigation, the layout thumbnail semantics match canvas slots: `brand`, `links`, `actions`.



Add Block modal behavior:
- Shows only block types allowed by the selected section type
- In multi-column layouts, includes a **Column** picker based on `section.layout.slots`
- In single-column layouts, column picker is hidden and blocks go to the default slot (`main`)

### Right Sidebar — Block Mode

When a specific block is selected (click a block on the canvas):

```
┌─ RIGHT SIDEBAR ──────────────────┐
│  ← Back to Section               │  ← Returns to section mode
│  Heading Block             [🗑]  │
│                                   │
│  ▼ Content                        │  ← Auto-generated from block's editableProps
│  Text:     [Build Faster._____]  │
│                                   │
│  ▼ Style                          │  ← Auto-generated from block's editableStyles
│  Size:     [sm][base][lg][xl]    │
│  Weight:   [normal][bold]        │
│  Align:    [← ][↔][→ ]          │
│  Color:    [● picker] (optional) │
│  Spacing ↕ [━━━●━━━]            │
│                                   │
└───────────────────────────────────┘
```

### Available Control Types

```typescript
type ControlType =
  | "short-text"      // Single-line input (button text, titles, headings)
  | "long-text"       // Textarea (descriptions, paragraphs)
  | "rich-text"       // Handled INLINE on canvas via Tiptap (not in sidebar)
  | "url"             // URL input with link icon validation
  | "image"           // Upload button + preview (Cloudinary)
  | "color"           // react-colorful HexColorPicker in Radix Popover
  | "slider"          // Continuous slider (Radix Slider) for padding, spacing, etc.
  | "background"      // Composite: type selector + color/gradient/image controls
  | "repeater"        // Add/remove/reorder list items with sub-fields
  | "icon-picker"     // Searchable Material Symbols grid
  | "toggle"          // Radix Switch (boolean)
  | "select"          // Radix Select dropdown
  | "size-picker"     // Segmented control for size choices (sm/md/lg/xl)
  | "align-picker";   // Segmented control for alignment (left/center/right)
```

### Background Control (composite)

The Background section in the right sidebar is a **composite control** with:
1. **Type selector** — icon buttons in a row: Solid Color | Gradient | Image (| Video post-MVP)
2. **Type-specific controls**:
   - **Solid**: single color picker
   - **Gradient**: two color pickers + direction dropdown
   - **Image**: upload button + optional overlay color/opacity
3. **Y-axis padding slider** — continuous Radix Slider from Small (e.g., 20px) to Large (e.g., 160px)


- `list` blocks support an `Inline Row` toggle (useful for navigation links in nav layouts).
### Control Labels (User-Facing)

ALWAYS use friendly labels. NEVER expose technical terms:
- "Heading" — NOT "h1" or "fontSize"
- "Subheading" — NOT "subtitle" or "h2"
- "Button Text" — NOT "ctaLabel"
- "Button Link" — NOT "href" or "buttonUrl"
- "Image" with upload button — NOT "imageUrl" or "src"
- "Background" — NOT "backgroundColor"
- Padding slider labeled "Small / Large" — NOT "paddingY: 64px"
- Size picker labeled "Small / Medium / Large" — NOT "fontSize: 2xl"
- Alignment labeled with icons (← ↔ →) — NOT "textAlign: center"

---

## Left Sidebar — Sections List

```
┌─ LEFT SIDEBAR ───────────────┐
│  PAGE SECTIONS          [⊕]  │
│  ─────────────────────────── │
│  ☰ [≡] Navbar     Sticky Top│  ← drag handle + icon + name + layout label
│  ☰ [★] Hero     ● 2-Column  │  ← ● = active/selected indicator
│  ☰ [▦] Features   3 Columns │
│  ☰ [❝] Testimonials  Slider │
│  ☰ [▤] CTA          Banner  │
│  ☰ [▣] Footer       Simple  │
│                               │
│  [+ Add Section]              │
└───────────────────────────────┘
```

Each row in the left sidebar shows:
- **Drag handle** (☰) — for reordering via @dnd-kit/sortable
- **Section icon** — from the section registry
- **Section name** — the section type label (Hero, Features, etc.)
- **Layout label** — the currently active layout (Centered, 2-Column, etc.)
- **Active indicator** — dot or highlight on the selected section
- **Hover actions** — visibility toggle, context menu (duplicate, delete)

Dragging happens **in this list**, not on the canvas. The canvas mirrors the order.

---

## Backend Architecture

### MongoDB Schemas

```
User:
  _id, name, email, passwordHash, avatar, provider, providerId,
  plan ("free"), createdAt, updatedAt

Project:
  _id, userId (ref→User), name, slug (unique, used as subdomain),
  status ("draft"|"published"),
  pages: [{
    id, name, slug, isDefault,
    sections: [{
      id, type,
      layout: { id, label, columns, distribution, alignment, direction, slots },
      blocks: [{ id, type, slot, order, props, style }],
      style: { backgroundColor, textColor, accentColor, backgroundType, ... paddingY },
      isVisible
    }]
  }],
  globalStyle: { fontFamily, primaryColor, borderRadius },
  seo: { title, description, ogImage },
  templateId (ref→Template), publishedUrl, publishedAt, publishedHtml,
  createdAt, updatedAt

Template:
  _id, name, category, description, thumbnail,
  pages: [{ sections: [...], ... }], globalStyle: {...},
  isActive, usageCount, createdAt

MediaAsset:
  _id, userId (ref→User), url, publicId, filename,
  size, width, height, format, createdAt
```

### API Conventions

```
Base URL:       /api
Auth header:    Authorization: Bearer <access_token>
Refresh token:  httpOnly cookie "refreshToken"
Validation:     Zod schemas (shared with frontend), validated via middleware
Errors:         { error: string, details?: object } with appropriate HTTP status
Pagination:     ?page=1&limit=20 → { data: [], total, page, pages }

Route naming:   RESTful
  GET    /api/projects           → list user's projects
  POST   /api/projects           → create project
  GET    /api/projects/:id       → get project (includes pages + sections + blocks)
  PUT    /api/projects/:id       → save full project state (pages, sections, blocks, globalStyle)
  DELETE /api/projects/:id       → delete project
  POST   /api/projects/:id/publish    → render + deploy
  POST   /api/projects/:id/unpublish  → take offline
  POST   /api/projects/:id/duplicate  → clone project

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
     - Build the layout grid from section.layout
     - For each block in each slot:
       - Look up component from BLOCK_REGISTRY
       - Render block with its props + inherited section/global style
     - Wrap blocks in the section shell (background, padding)
  3. Wrap in HTML shell:
     - <!DOCTYPE html>, <head> with SEO meta, Tailwind CDN, Google Font
     - All rendered section HTML in <body>
  4. sanitize-html (XSS prevention)
  5. html-minifier-terser (minify)
  6. Save as static file → serve via Nginx/Caddy
  7. Map to subdomain: {slug}.builder.app
  8. Update project status → "published"
  9. Return { publishedUrl, publishedAt }
```

---

## Styling Rules

```
1. TAILWIND ONLY — no custom CSS files, no CSS modules, no styled-components
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
    - "none" → rounded-none
    - "sm"   → rounded-md
    - "md"   → rounded-lg
    - "lg"   → rounded-xl
    - "full" → rounded-full
11. Block fontSize map (block.style.fontSize):
    - "sm"   → text-sm
    - "base" → text-base
    - "lg"   → text-lg
    - "xl"   → text-xl
    - "2xl"  → text-2xl
    - "3xl"  → text-3xl
    - "4xl"  → text-4xl
    - "5xl"  → text-5xl
12. Block width map (block.style.width):
    - "auto" → w-auto
    - "sm"   → max-w-sm
    - "md"   → max-w-md
    - "lg"   → max-w-lg
    - "full" → w-full
```

---

## File/Folder Structure

### Frontend

```
app/
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── controls/                # Right sidebar control components
│   │   ├── ShortTextControl.tsx
│   │   ├── LongTextControl.tsx
│   │   ├── UrlControl.tsx
│   │   ├── ColorControl.tsx
│   │   ├── SliderControl.tsx
│   │   ├── BackgroundControl.tsx  # Composite: type + color/gradient/image + padding
│   │   ├── ImageControl.tsx
│   │   ├── RepeaterControl.tsx
│   │   ├── SizePickerControl.tsx
│   │   ├── AlignPickerControl.tsx
│   │   ├── FieldRenderer.tsx      # Control type switch
│   │   └── ...
│   ├── InlineText.tsx           # Tiptap inline editor wrapper
│   └── SortableItem.tsx         # dnd-kit sortable wrapper (used in sidebar lists)
│
├── blocks/                      # Block components (one per block type)
│   ├── HeadingBlock.tsx
│   ├── TextBlock.tsx
│   ├── ButtonBlock.tsx
│   ├── ImageBlock.tsx
│   ├── IconBlock.tsx
│   ├── SpacerBlock.tsx
│   ├── BadgeBlock.tsx
│   ├── DividerBlock.tsx
│   ├── ListBlock.tsx
│   ├── QuoteBlock.tsx
│   └── BlockRenderer.tsx        # Block type switch + renders correct component
│
├── sections/                    # Section shell renderers
│   ├── SectionRenderer.tsx      # Layout grid builder + block placement
│   ├── NavbarRenderer.tsx       # Special layout for navbar (not grid-based)
│   └── FooterRenderer.tsx       # Optional special layout for footer
│
├── editor/
│   ├── EditorPage.tsx           # Main three-panel layout
│   ├── EditorCanvas.tsx         # Center: section rendering + zoom
│   ├── EditorToolbar.tsx        # Top bar: name, device, undo/redo, preview, publish
│   ├── SectionsListPanel.tsx    # LEFT sidebar: section list with drag reorder
│   ├── SectionSettings.tsx      # RIGHT sidebar: section mode (layout + blocks + background)
│   ├── BlockSettings.tsx        # RIGHT sidebar: block mode (content + style)
│   ├── AddSectionModal.tsx      # Section type picker dialog
│   ├── AddBlockModal.tsx        # Block type picker (within a section)
│   └── GlobalStylePanel.tsx     # RIGHT sidebar when nothing selected
│
├── pages/
│   ├── Dashboard.tsx
│   ├── TemplateGallery.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Settings.tsx
│
├── config/
│   ├── sectionRegistry.ts      # Section type registry
│   ├── blockRegistry.ts        # Block type registry
│   └── layoutTemplates.ts      # Pre-defined layout templates
│
├── stores/
│   └── editorStore.ts           # Zustand + Immer
│
├── hooks/
│   ├── useAutoSave.ts
│   ├── useProject.ts
│   └── useTemplates.ts
│
├── lib/
│   ├── api.ts                   # API client
│   └── utils.ts                 # Helpers (cn, etc.)
│
├── types/
│   └── editor.ts                # All editor TypeScript interfaces
│
└── routes.ts / root.tsx
```

### Backend

```
server/src/
├── config/         # db.ts, cloudinary.ts, passport.ts, env.ts
├── models/         # User.ts, Project.ts, Template.ts, MediaAsset.ts
├── routes/         # auth.ts, projects.ts, templates.ts, upload.ts
├── controllers/    # authController.ts, projectController.ts, etc.
├── middleware/      # auth.ts, validate.ts, upload.ts, errorHandler.ts
├── services/       # publishService.ts, emailService.ts
├── validators/     # Zod schemas (shared with frontend where possible)
├── utils/          # logger.ts, generateSlug.ts, tokens.ts
├── shared/         # blockRegistry.ts, sectionRegistry.ts (shared with frontend for SSR)
├── app.ts          # Express setup
└── server.ts       # Entry point
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
- No custom class names — use Tailwind utilities only
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
- Keep components under 150 lines — extract sub-components when longer
- One component per file

REACT:
- Functional components only (no class components)
- Hooks at the top of the component
- Memoize expensive computations with useMemo
- Memoize callbacks passed to children with useCallback
- Use React.lazy for route-level code splitting
- Never put business logic in components — put it in the store or hooks

ZUSTAND:
- All editor state mutations go through the store (never setState in components)
- Use Immer middleware for nested updates
- Push to history stack before every mutation (for undo/redo)
- Debounce history pushes for rapid changes (typing, color dragging, slider dragging)
- Two selection states: selectedSectionId and selectedBlockId

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
- Apply block.style (fontSize, textAlign, fontWeight, etc.) via Tailwind class maps
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
  - defaultLayoutId (the default layout when added)
  - defaultBlocks (the pre-configured blocks with slot assignments)
  - defaultStyle (background, padding, colors)
  - allowedBlockTypes (which blocks can be added to this section)
- The default blocks should create a polished, professional-looking section
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
| Content model | Sections contain blocks in layout slots | Replaces rigid variant system; users can add/remove blocks without new code |
| Layout system | Pre-defined layout templates (NOT CSS grid config) | Users pick a visual layout, never configure columns directly |
| Editor layout | Three panels: left (sections list) + center (canvas) + right (settings) | Matches reference design; separates navigation from editing |
| Selection model | Two levels: section-level and block-level | Section for layout/background; block for content/style |
| Editor theme | Dark theme | Premium feel; matches reference design. Tokens in Style Guide file |
| Section reordering | Drag in the LEFT sidebar list (not on the canvas) | Cleaner UX; canvas stays WYSIWYG without drag handles cluttering |
| Block reordering | Drag in the RIGHT sidebar block list (within selected section) | Consistent with section reordering pattern |
| Page model | Vertical stack of sections, each with layout + blocks | Composable yet structured |
| Text editing | Inline on canvas (Tiptap) for text/heading blocks | More intuitive than editing in sidebar |
| Style inheritance | Global → Section → Block (cascade with overrides) | Consistent theming with per-block flexibility |
| Block styles | Constrained choices (sm/md/lg, not px values) | Prevents bad designs; feels simple |
| Padding control | Continuous slider (Small / Large) | More precise than discrete toggles; matches reference design |
| Background control | Composite (solid/gradient/image + color picker + padding slider) | Grouped logically; matches reference design |
| Data storage | JSON in MongoDB | Sections + blocks as nested documents; single read per page |
| State management | Zustand (NOT Redux/Context) | Simpler API, less boilerplate, perfect for editor state |
| Server state | TanStack Query (NOT Zustand) | Handles caching, refetching, mutations — don't mix with editor state |
| DnD library | @dnd-kit (NOT react-beautiful-dnd) | Better maintained, more flexible, accessible |
| CSS approach | Tailwind (NOT CSS modules/styled-components) | Utility-first matches section-based architecture perfectly |
| UI primitives | Radix UI (NOT Material UI/Ant Design) | Unstyled, accessible, composable — pairs with Tailwind |
| Icons | Google Material Symbols (NOT Lucide) | Consistent with style guide; larger icon set |
| Publishing output | Static HTML + Tailwind CDN | Simple, fast, no server runtime needed for published pages |
| AI features | Parked until editor is stable | See [AI Integration (Parked)](#ai-integration-parked) |

---

## MVP Scope Boundaries

### Build This (MVP)

- Email/password + Google OAuth signup/login
- User dashboard (project list)
- Template gallery (8-12 templates as section+block presets)
- Block-based editor with 7 section types and 11 block types
- Three-panel editor: left sections list, center canvas, right settings
- Drag-to-reorder sections (left sidebar) and blocks (right sidebar)
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
- AI content generation (parked — see below)
- Real-time collaboration
- Version history
- Analytics integrations
- Blog / CMS
- Custom code injection
- Admin panel (use MongoDB Compass)
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
- Select any text or heading block → "Rewrite" button appears
- Options: Make shorter, Make more persuasive, Change tone, Translate
- Implementation: Send block.props.text + context to Claude API → return rewritten text
- No data model changes needed — just updates block.props.text

**Phase B: AI Full Page Generator (biggest acquisition feature)**
- User describes their business/page in natural language
- AI returns a complete page structure: sections + blocks + layout choices + styles
- Implementation: Structured output from Claude that matches the Project data model
- Requires: `aiContext` field on Project (businessName, industry, description, vibe, targetAudience)
- The AI output must conform to the exact Section/Block/Layout schema

**Phase C: AI Section Auto-Fill**
- User adds a new section → AI pre-fills blocks with contextually relevant content
- Uses `aiContext` from the project to generate relevant copy
- Example: Add "Features" section to a dog walking site → AI fills in "Daily Walks", "GPS Tracking", etc.

**Phase D: AI Style Advisor**
- User provides brand color or uploads logo → AI suggests complete color palette + font pairing
- Returns a GlobalStyle + per-section style overrides
- Implementation: Color theory + Claude for font/vibe matching

**Phase E: AI Image Suggestions**
- When editing an image block, show "AI Suggest" option
- AI generates search queries based on page context → Unsplash/Pexels API → curated results
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
| **Section** | A full-width container with a layout template, background style, and blocks. The top-level building unit of a page. |
| **Block** | An individual content piece within a section (heading, text, button, image, icon, etc.). The atomic unit of content. |
| **Block Type** | The kind of content a block represents (heading, text, button, image, etc.). Determines what controls appear in the sidebar. |
| **Layout Template** | A pre-defined spatial arrangement for blocks within a section (1-col centered, 2-col 50/50, etc.). Users pick from a visual grid. |
| **Slot** | A named position within a layout template where blocks are placed ("main", "left", "right", "col-1", etc.). |
| **Section Registry** | Central config mapping section types to allowed layouts, default blocks, and constraints. |
| **Block Registry** | Central config mapping block types to components, default props/styles, and editable fields. |
| **Block Style** | Constrained visual options for a block (fontSize, fontWeight, textAlign, width, spacing, positioning mode, scale). Never raw CSS. |
| **Section Style** | Design data for a section (backgroundColor, backgroundType, paddingY, textColor, accentColor). |
| **Global Style** | Page-wide design settings (fontFamily, primaryColor, borderRadius). Inherited by all sections and blocks. |
| **Style Inheritance** | The cascade: Global → Section → Block. Each level can override the parent. |
| **Canvas** | The center panel where sections and blocks are rendered WYSIWYG. |
| **Left Sidebar / Sections List** | The left panel showing all sections as a reorderable list. |
| **Right Sidebar / Settings Panel** | The right panel showing context-sensitive controls (section mode, block mode, or global settings). |
| **Section Mode** | Right sidebar state when a section is selected: shows layout picker, block list, and background controls. |
| **Block Mode** | Right sidebar state when a block is selected: shows block content and style controls. |
| **InlineText** | The Tiptap-based component that makes text directly editable on the canvas. Used by heading and text blocks. |
| **Control** | A right sidebar input component (ColorControl, SliderControl, SizePickerControl, etc.). |
| **FieldRenderer** | The switch component that renders the correct control based on field type. |
| **Background Control** | Composite control: type selector (solid/gradient/image) + picker + padding slider. |
| **Preset** | A section type's default configuration (layout + blocks + style). What users get when they click "Add Section". |
| **Slug** | URL-friendly project name used as the subdomain (my-landing-page.builder.app). |
| **Publishing** | Rendering sections and blocks to static HTML and deploying to a subdomain. |
| **Template** | A pre-configured set of sections with blocks and styles, used as a starting point for a new project. |
| **Style Guide** | Separate file containing all color tokens, theme values, and visual design specs for the editor UI. |

---

*Document Version: 3.16 � Debounced absolute drag history with final-position undo support*
*Last Updated: February 16, 2026*
*Keep this document updated as architecture decisions change.*
*For colors and theming, always reference the separate Style Guide file.*
