# 📋 AI Prompt Context — Website Builder Project

> **Copy-paste this document (or relevant sections) into every AI conversation to keep outputs consistent across the entire development lifecycle.**
> **For colors, theming, and visual design tokens, refer to the separate Style Guide file.**

---

## How to Use This Document

1. **Starting a new AI chat?** Paste the [Core Context](#core-context) section at minimum.
2. **Working on the editor?** Also paste [Editor Architecture](#editor-architecture) and [Section System](#section-system).
3. **Working on the backend?** Also paste [Backend Architecture](#backend-architecture).
4. **Building a specific section component?** Also paste [Section Component Contract](#section-component-contract).
5. **Writing API endpoints?** Also paste [API Conventions](#api-conventions).
6. **Styling anything?** Also paste [Styling Rules](#styling-rules) + the **Style Guide** file.

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
- Section-based editor (NOT freeform drag-and-drop)
- Pre-designed, polished sections that users reorder — not a blank canvas
- Simple, friendly controls — NEVER expose CSS properties, layers, or code
- Every page is a vertical stack of sections
- Users edit content through a right sidebar and inline text editing
- Dark-themed, modern editor UI with a premium feel
- Looks beautiful by default — zero design skill required

CURRENT PHASE: MVP (10-12 week build)
MVP SCOPE: Auth, dashboard, template gallery, section-based editor (7 section types),
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
Icons:              Lucide React (lucide-react)
State (Editor):     Zustand with Immer middleware
State (Server):     TanStack Query v5 (@tanstack/react-query)
Drag-and-Drop:      @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/modifiers
Inline Text Edit:   Tiptap (@tiptap/react, @tiptap/starter-kit, extensions)
Color Picker:       react-colorful (2KB, in Radix Popover)
Animations:         Framer Motion
Forms:              React Hook Form + Zod + @hookform/resolvers
Toasts:             Sonner
IDs:                nanoid (short unique IDs for sections)
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
│  (Sections   │   (scrollable, centered,            │    (Settings for      │
│   List)      │    dark background)                  │     selected section) │
│              │                                      │                      │
│  Page        │   ┌──────────────────────────────┐  │   Layout Variant      │
│  ─────────── │   │  ⭐ Hero Section (badge)      │  │   [◻][◻][◻][◻]      │
│  ☰ Navbar    │   │                               │  │   (visual thumbnails)│
│    Default   │   │  "Grow Your Business"         │  │                      │
│  ☰ Hero    ● │   │  "We help startups scale"     │  │   Content            │
│    Centered  │   │       [Get Started]            │  │   ─────────────      │
│  ☰ Features  │   │                               │  │   Heading: [___]     │
│    Grid      │   └──────────────────────────────┘  │   Subheading: [___]  │
│  ☰ CTA       │                                      │   Button: [___]      │
│    Banner    │   ┌──────────────────────────────┐  │   Image: [📷]        │
│  ☰ Footer    │   │  Features Section             │  │                      │
│    Simple    │   │  ⚡ Fast  🛡 Secure  ❤ Easy   │  │   Background         │
│              │   └──────────────────────────────┘  │   ─────────────      │
│              │                                      │   Type: [🎨][🖼][▣]  │
│  [➕ Add     │   ┌──────────────────────────────┐  │   Color: [picker]    │
│   Section]   │   │        ➕ Add Section          │  │   Y Padding:        │
│              │   └──────────────────────────────┘  │   [━━━━━●━━━] slider │
│              │                                      │   Small ←──→ Large   │
│              │         [ - 100% + ] (zoom)         │                      │
├──────────────┴─────────────────────────────────────┴───────────────────────┤
```

### Left Sidebar — Sections List Panel

- Displays all sections in page order as a **vertical list**
- Each row shows: **drag handle (☰)** + **section name** + **variant subtitle** + **active indicator**
- Sections are **reorderable via drag** within this list (dnd-kit sortable)
- Clicking a row **selects** that section (highlights it on canvas + opens settings in right sidebar)
- **"➕ Add Section"** button at the bottom of the list
- The left sidebar is collapsible (hamburger icon in toolbar)

### Center Canvas

- Dark background with the page rendered in a centered, scrollable container
- Selected section has a **floating label badge** (e.g., "⭐ Hero Section") at the top
- Sections are rendered as they will appear when published (WYSIWYG)
- Click text on canvas → **inline edit via Tiptap**
- **Zoom controls** at the bottom center: `[ - 100% + ]`
- Supports **device preview toggle** from toolbar (desktop/mobile width)

### Right Sidebar — Section Settings Panel

When a section is selected, the right sidebar shows three collapsible groups:

1. **Layout Variant** — visual thumbnail grid (2-4 options). Click to switch layout.
2. **Content** — auto-generated controls based on section registry's `editableProps`
   (heading, subheading, button text, button link, image upload, repeater items, etc.)
3. **Background** — section background options:
   - **Type selector**: icon buttons for solid color, gradient, image, (video post-MVP)
   - **Color/gradient picker**: react-colorful inside Radix Popover
   - **Y-axis padding slider**: continuous slider (Small ↔ Large), NOT discrete S/M/L toggles

When **no section is selected**, the right sidebar shows **Global Page Settings**
(font family, primary color, corner style).

### Toolbar

- **Left**: hamburger menu (collapse left sidebar) + page name (editable dropdown)
- **Center**: device preview toggle (desktop/mobile icons) + undo/redo buttons
- **Right**: Preview button, Publish button, "Last saved: X min ago" timestamp

### Key Behaviors

```
STATE MANAGEMENT:
- Zustand store (editorStore) holds: sections[], selectedId, globalStyle,
  history[], future[], isDirty, device, zoom
- Immer middleware for mutable-looking immutable updates
- TanStack Query handles all API calls (fetch project, auto-save, publish)
- Auto-save: debounced 3 seconds after any change

DRAG-AND-DROP:
- Sections are reordered by dragging in the LEFT SIDEBAR list (not on the canvas)
- Uses @dnd-kit/sortable with vertical list strategy
- Drag handle (☰ grip icon) on each row in the left sidebar
- Canvas updates in real-time as sections are reordered

SELECTION:
- Click a section row in the left sidebar → selects it
- OR click directly on a section in the canvas → selects it
- Selected section: highlighted on canvas + floating label badge + right sidebar shows its settings
- Click empty canvas area or deselect → right sidebar shows global settings

ZOOM:
- Zoom controls at bottom of canvas: minus button, percentage display, plus button
- Zoom range: 50% to 150% (default 100%)
- Affects canvas scale only, not sidebar panels

EDITOR DOES NOT HAVE (by design):
- Freeform element positioning
- CSS property panels (no margin/padding/font-size inputs)
- Layer tree or component tree
- Grid/column configuration
- Custom HTML/CSS/JS editing
- Pixel-level positioning
- Nested components or component composition
```

---

## Section System

### Data Model

```typescript
interface Section {
  id: string;                    // nanoid(10)
  type: SectionType;             // "hero" | "features" | "cta" | etc.
  variant: string;               // "centered" | "split-left" | "cards" | etc.
  props: Record<string, any>;    // Content data (headline, features[], etc.)
  style: SectionStyle;           // Design data (background, padding)
  isVisible: boolean;            // Toggle visibility without deleting
}

interface SectionStyle {
  backgroundColor?: string;      // Hex color
  textColor?: string;            // Hex color
  accentColor?: string;          // Hex color for buttons/highlights
  backgroundImage?: string;      // Cloudinary URL
  backgroundType?: "solid" | "gradient" | "image";
  gradientFrom?: string;         // Hex color (if gradient)
  gradientTo?: string;           // Hex color (if gradient)
  gradientDirection?: string;    // "to bottom" | "to right" | etc.
  paddingY?: number;             // Continuous value (mapped to rem/px), controlled by slider
}

interface GlobalStyle {
  fontFamily: string;            // Google Font name ("Inter", "Playfair Display")
  primaryColor: string;          // Default accent color for all sections
  borderRadius: "none" | "sm" | "md" | "lg" | "full";  // Button/card corners
}

type SectionType =
  | "navbar" | "hero" | "features" | "cta"
  | "testimonials" | "faq" | "footer"
  // Post-MVP:
  | "pricing" | "gallery" | "stats" | "logos"
  | "newsletter" | "contact" | "team" | "divider";
```

### Section Registry Pattern

Every section type is registered in a central `SECTION_REGISTRY` object:

```typescript
SECTION_REGISTRY[sectionType] = {
  component: React.ComponentType,        // The React component to render
  label: string,                         // "Hero", "Features", etc.
  icon: string,                          // Lucide icon name
  description: string,                   // For the "Add Section" modal
  variants: VariantDef[],                // { id, label, thumbnail }[]
  defaultProps: Record<string, any>,     // Default content when section is added
  defaultStyle: Record<string, any>,     // Default background/padding
  editableProps: EditableField[],        // What content controls to show in right sidebar
  editableStyles: EditableField[],       // What background controls to show in right sidebar
}
```

The right sidebar **auto-generates** its controls by reading the selected section's `editableProps` and `editableStyles` from the registry. This means:
- Adding a new section type = adding one registry entry + one component
- No sidebar code changes needed per section
- Controls are consistent across all sections

### Section Component Contract

Every section component receives the same props interface:

```typescript
interface SectionComponentProps {
  section: Section;              // Full section data (type, variant, props, style)
  isEditing: boolean;            // true in editor, false in preview/published
  onUpdateProp: (key: string, value: any) => void;  // Update a content prop
}
```

Rules for section components:
- Use `section.props.*` for content, `section.style.*` for design
- Use `InlineText` component for all editable text (headline, subtitle, body)
- Use inline `style={{}}` for dynamic values (backgroundColor, textColor, accentColor, paddingY)
- Use Tailwind classes for structural layout (flex, grid, max-width)
- Support the `isEditing` flag: disable links, show placeholder states when editing
- Switch rendering based on `section.variant`
- Never import or read from the Zustand store directly — only use passed props
- Apply `paddingY` from `section.style.paddingY` as inline style

### MVP Section Types

| Type | Variants | Key Props |
|------|----------|-----------|
| navbar | simple, with-cta, centered-logo | logo, navLinks[], ctaText, ctaUrl |
| hero | centered, split-left, split-right, bg-image | headline, subheadline, buttonText, buttonUrl, imageUrl |
| features | cards, icons-row, alternating | headline, features[]{icon, title, description} |
| cta | banner, split, minimal | headline, subheadline, buttonText, buttonUrl |
| testimonials | grid, single, slider | headline, testimonials[]{quote, name, role, avatar} |
| faq | accordion, two-column, simple | headline, faqs[]{question, answer} |
| footer | multi-column, simple, centered | logo, columns[]{title, links[]}, copyright, socialLinks[] |

---

## Sidebar Controls

### Right Sidebar Structure (for selected section)

The right sidebar is divided into **three collapsible groups**:

```
┌─ RIGHT SIDEBAR ──────────────────┐
│                                   │
│  ▼ Layout Variant                 │  ← Visual thumbnail grid (2-4 options)
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐            │
│  │  │ │  │ │  │ │  │            │
│  └──┘ └──┘ └──┘ └──┘            │
│                                   │
│  ▼ Content                        │  ← Auto-generated from editableProps
│  Heading:    [________________]   │
│  Subheading: [________________]   │
│  Button Text:[________________]   │
│  Button Link:[________________]   │
│  Image:      [📷 Upload]         │
│  Features:   [repeater list]     │
│                                   │
│  ▼ Background                     │  ← Background type + color/gradient + padding
│  Type: [🎨 solid][▣ gradient]    │
│        [🖼 image]                │
│  Color:  [● picker]              │
│  Y Padding:                      │
│  Small [━━━━━━●━━━━━━] Large    │
│                                   │
└───────────────────────────────────┘
```

### Available Control Types

```typescript
type ControlType =
  | "short-text"      // Single-line input (button text, titles)
  | "long-text"       // Textarea (descriptions, FAQ answers)
  | "rich-text"       // Handled INLINE on canvas via Tiptap (not in sidebar)
  | "url"             // URL input with link icon validation
  | "image"           // Upload button + preview (Cloudinary)
  | "color"           // react-colorful HexColorPicker in Radix Popover
  | "slider"          // Continuous slider (Radix Slider) for padding
  | "background"      // Composite: type selector + color/gradient/image controls
  | "repeater"        // Add/remove/reorder list items with sub-fields
  | "icon-picker"     // Searchable Lucide icon grid
  | "toggle"          // Radix Switch (boolean)
  | "select";         // Radix Select dropdown
```

### Background Control (composite)

The Background section in the right sidebar is a **composite control** with:
1. **Type selector** — icon buttons in a row: Solid Color | Gradient | Image (| Video post-MVP)
2. **Type-specific controls**:
   - **Solid**: single color picker
   - **Gradient**: two color pickers + direction dropdown
   - **Image**: upload button + optional overlay color/opacity
3. **Y-axis padding slider** — continuous Radix Slider from Small (e.g., 2rem) to Large (e.g., 10rem)

### Control Labels (User-Facing)

ALWAYS use friendly labels. NEVER expose technical terms:
- ✅ "Heading" — NOT "headline" or "h1"
- ✅ "Subheading" — NOT "subheadline" or "subtitle"
- ✅ "Button Text" — NOT "ctaLabel"
- ✅ "Button Link" — NOT "href" or "buttonUrl"
- ✅ "Image" with upload button — NOT "imageUrl"
- ✅ "Background" — NOT "backgroundColor"
- ✅ Padding slider labeled "Small ↔ Large" — NOT "paddingY: 64px"

---

## Left Sidebar — Sections List

```
┌─ LEFT SIDEBAR ───────────────┐
│  Page                         │
│  ─────────────────────────── │
│  ☰  Navbar          Default  │  ← drag handle + name + variant
│  ☰  Hero          ● Centered │  ← ● = active/selected indicator
│  ☰  Features         Grid    │
│  ☰  Testimonials     Cards   │
│  ☰  CTA             Banner   │
│  ☰  Footer          Simple   │
│                               │
│  [➕ Add Section]             │
└───────────────────────────────┘
```

Each row in the left sidebar shows:
- **Drag handle** (☰) — for reordering via @dnd-kit/sortable
- **Section name** — the section type label (Hero, Features, etc.)
- **Variant name** — the currently active variant (Centered, Grid, etc.)
- **Active indicator** — dot or highlight on the selected section
- **Right-click or hover menu** — duplicate, delete, toggle visibility

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
  sections: [{ id, type, variant, props, style, isVisible }],
  globalStyle: { fontFamily, primaryColor, borderRadius },
  seo: { title, description, ogImage },
  templateId (ref→Template), publishedUrl, publishedAt, publishedHtml,
  createdAt, updatedAt

Template:
  _id, name, category, description, thumbnail,
  sections: [...], globalStyle: {...},
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
  GET    /api/projects/:id       → get project
  PUT    /api/projects/:id       → save sections + globalStyle
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
  1. Fetch project (sections + globalStyle + SEO) from MongoDB
  2. For each section:
     - Look up component from SECTION_REGISTRY
     - ReactDOMServer.renderToStaticMarkup(<Component section={s} isEditing={false} />)
  3. Wrap in HTML shell:
     - <!DOCTYPE html>, <head> with SEO meta, Tailwind CDN, Google Font
     - All section HTML in <body>
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
3. Use inline style={{}} for dynamic values from section data:
   - style={{ backgroundColor: section.style.backgroundColor }}
   - style={{ color: section.style.textColor }}
   - style={{ paddingTop: section.style.paddingY, paddingBottom: section.style.paddingY }}
4. For editor shell colors/theming: reference the STYLE GUIDE file's design tokens
5. shadcn/ui components for dashboard/settings/auth UI
6. Radix UI primitives for editor controls (Popover, Select, Slider, Dialog, etc.)
7. Framer Motion for animations (section add/remove, drag, sidebar transitions)
8. Responsive: all sections must look good on mobile without user configuration
9. Section padding: paddingY is a continuous number value (in rem or px),
   controlled by a Radix Slider, NOT discrete S/M/L/XL toggles
10. Border radius map (globalStyle.borderRadius):
    - "none" → rounded-none
    - "sm"   → rounded-md
    - "md"   → rounded-lg
    - "lg"   → rounded-xl
    - "full" → rounded-full
```

---

## File/Folder Structure

### Frontend

```
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── controls/               # Right sidebar control components
│   │   ├── ShortTextControl.tsx
│   │   ├── ColorControl.tsx
│   │   ├── SliderControl.tsx
│   │   ├── BackgroundControl.tsx  # Composite: type + color/gradient/image + padding
│   │   ├── ImageControl.tsx
│   │   ├── RepeaterControl.tsx
│   │   └── ...
│   ├── InlineText.tsx          # Tiptap inline editor
│   ├── SortableSection.tsx     # dnd-kit sortable wrapper (for LEFT sidebar list)
│   ├── SectionRenderer.tsx     # Registry lookup + render
│   ├── FieldRenderer.tsx       # Control type switch
│   └── VariantPicker.tsx       # Layout variant thumbnail toggle
│
├── sections/                   # Pre-designed section components
│   ├── Hero/
│   │   ├── HeroSection.tsx     # Variant router
│   │   ├── HeroCentered.tsx
│   │   ├── HeroSplitLeft.tsx
│   │   └── HeroSplitRight.tsx
│   ├── Features/
│   ├── CTA/
│   ├── Testimonials/
│   ├── FAQ/
│   ├── Navbar/
│   └── Footer/
│
├── editor/
│   ├── EditorPage.tsx          # Main three-panel layout
│   ├── EditorCanvas.tsx        # Center: section rendering + zoom
│   ├── EditorToolbar.tsx       # Top bar: name, device, undo/redo, preview, publish
│   ├── SectionsListPanel.tsx   # LEFT sidebar: section list with drag reorder
│   ├── SectionSettings.tsx     # RIGHT sidebar: variant + content + background
│   ├── AddSectionModal.tsx     # Section type picker dialog
│   └── GlobalStylePanel.tsx    # RIGHT sidebar when nothing selected
│
├── pages/
│   ├── Dashboard.tsx
│   ├── TemplateGallery.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Settings.tsx
│
├── config/
│   └── sectionRegistry.ts     # Central registry
│
├── stores/
│   └── editorStore.ts          # Zustand + Immer
│
├── hooks/
│   ├── useAutoSave.ts
│   ├── useProject.ts
│   └── useTemplates.ts
│
├── lib/
│   ├── api.ts                  # API client
│   └── utils.ts                # Helpers
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
└── App.tsx / main.tsx
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
├── shared/         # sectionRegistry.ts (shared with frontend for SSR)
├── app.ts          # Express setup
└── server.ts       # Entry point
```

---

## Naming Conventions

```
FILES:
- React components:     PascalCase.tsx     (HeroSection.tsx, EditorCanvas.tsx)
- Hooks:                camelCase.ts       (useAutoSave.ts, useProject.ts)
- Stores:               camelCase.ts       (editorStore.ts)
- Utils/config:         camelCase.ts       (sectionRegistry.ts, api.ts)
- Types:                camelCase.ts       (index.ts in types/)
- Backend routes:       camelCase.ts       (projects.ts, auth.ts)
- Backend models:       PascalCase.ts      (User.ts, Project.ts)

VARIABLES & FUNCTIONS:
- React components:     PascalCase         (function HeroSection())
- Hooks:                use* prefix        (useEditorStore, useAutoSave)
- Event handlers:       handle* prefix     (handleDragEnd, handlePublish)
- Boolean state:        is*/has* prefix    (isDirty, isEditing, hasImage)
- Constants:            UPPER_SNAKE        (SECTION_REGISTRY, MAX_FILE_SIZE)
- Types/Interfaces:     PascalCase         (Section, SectionStyle, GlobalStyle)
- Enums:                PascalCase         (SectionType)
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

### For Building a New Section

```
Context: I'm building a no-code website builder. [Paste Core Context section above]

Task: Build the [SectionType] section component.

Requirements:
- Follow the SectionComponentProps interface: { section, isEditing, onUpdateProp }
- Support these variants: [list variants]
- Use InlineText for editable text fields
- Use Tailwind for layout, inline style={{}} for dynamic colors and paddingY
- Handle isEditing flag (disable links, show placeholders when editing)
- Include the section registry entry with defaultProps, defaultStyle,
  editableProps, and editableStyles

The section should look polished and professional by default with the
placeholder content. Refer to the Style Guide for theming.
```

### For Building a Backend Endpoint

```
Context: I'm building the backend for a no-code website builder. [Paste Core Context + Backend Architecture]

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
Context: I'm building the editor right sidebar for a no-code website builder. [Paste Core Context + Sidebar Controls]

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
| Editor paradigm | Section-based (NOT freeform) | Target users are non-technical; freeform is overwhelming |
| Editor layout | Three panels: left (sections list) + center (canvas) + right (settings) | Matches reference design; separates navigation from editing |
| Editor theme | Dark theme | Premium feel; matches reference design. Tokens in Style Guide file |
| Section reordering | Drag in the LEFT sidebar list (not on the canvas) | Cleaner UX; canvas stays WYSIWYG without drag handles cluttering |
| Page model | Vertical stack of sections | Simpler than grid-based; matches Carrd/Squarespace model |
| Text editing | Inline on canvas (Tiptap) | More intuitive than editing in sidebar |
| Padding control | Continuous slider (Small ↔ Large) | More precise than discrete S/M/L toggles; matches reference design |
| Background control | Composite (solid/gradient/image + color picker + padding slider) | Grouped logically; matches reference design |
| Section data | JSON array in MongoDB | Native JSON storage, no joins needed, single read per page |
| State management | Zustand (NOT Redux/Context) | Simpler API, less boilerplate, perfect for editor state |
| Server state | TanStack Query (NOT Zustand) | Handles caching, refetching, mutations — don't mix with editor state |
| DnD library | @dnd-kit (NOT react-beautiful-dnd) | Better maintained, more flexible, accessible |
| CSS approach | Tailwind (NOT CSS modules/styled-components) | Utility-first matches section-based architecture perfectly |
| UI primitives | Radix UI (NOT Material UI/Ant Design) | Unstyled, accessible, composable — pairs with Tailwind |
| Publishing output | Static HTML + Tailwind CDN | Simple, fast, no server runtime needed for published pages |
| Rejected: GrapesJS | Too many controls, too technical for target users |
| Rejected: Puck Editor | Too modular, requires building too much UI |
| Rejected: Craft.js | Too low-level, requires building everything yourself |
| Rejected: Freeform canvas | Overwhelming for non-technical users |
| Rejected: CSS property panels | Violates "zero learning curve" principle |

---

## MVP Scope Boundaries

### ✅ Build This

- Email/password + Google OAuth signup/login
- User dashboard (project list)
- Template gallery (8-12 templates)
- Section-based editor with 7 section types
- Three-panel editor: left sections list, center canvas, right settings
- Drag-to-reorder in left sidebar, inline text editing on canvas
- Section variants (2-4 per type) with visual thumbnail picker
- Background controls (solid/gradient/image + padding slider)
- Image upload to Cloudinary
- Basic SEO (title, description, slug)
- Publish to free subdomain
- Undo/redo, auto-save, zoom controls
- Dark-themed editor UI

### ❌ Don't Build This (Yet)

- Multi-page websites
- Custom domains
- Forms / lead capture
- E-commerce / payments
- AI content generation
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
- Video background type (post-MVP)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Section** | A pre-designed, full-width content block (Hero, Features, CTA, etc.) |
| **Variant** | A layout option within a section type (e.g., Hero → centered, split-left) |
| **Section Registry** | Central config object mapping section types to components, variants, and controls |
| **Props** | Content data within a section (headline, buttonText, features[]) |
| **Style** | Design data within a section (backgroundColor, backgroundType, paddingY) |
| **Global Style** | Page-wide design settings (fontFamily, primaryColor, borderRadius) |
| **Canvas** | The center panel where sections are rendered WYSIWYG |
| **Left Sidebar / Sections List** | The left panel showing all sections as a reorderable list |
| **Right Sidebar / Section Settings** | The right panel showing controls for the selected section |
| **InlineText** | The Tiptap-based component that makes text directly editable on the canvas |
| **Control** | A right sidebar input component (ColorControl, SliderControl, etc.) |
| **FieldRenderer** | The switch component that renders the correct control based on field type |
| **Background Control** | Composite control: type selector (solid/gradient/image) + picker + padding slider |
| **Slug** | URL-friendly project name used as the subdomain (my-landing-page.builder.app) |
| **Publishing** | Rendering sections to static HTML and deploying to a subdomain |
| **Template** | A pre-configured set of sections with content and styles, used as a starting point |
| **Style Guide** | Separate file containing all color tokens, theme values, and visual design specs |

---

*Document Version: 2.0 — Updated to match editor reference design*
*Last Updated: February 2026*
*Keep this document updated as architecture decisions change.*
*For colors and theming, always reference the separate Style Guide file.*
