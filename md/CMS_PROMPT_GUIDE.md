# AI Prompt Context - CMS App (Isolated From Page Builder)

> Use this guide for all AI prompts related to the CMS app (`/cms`).
> This CMS is intentionally isolated from the existing page builder editor.

---

## Core Rule (Do Not Break)

The CMS app must not overlap with the existing page builder editor for now.

That means:

1. Do not change `app/editor/*` for CMS feature work.
2. Do not change `app/stores/editorStore.ts` for CMS feature work.
3. Do not introduce section/group logic into CMS.
4. Do not wire CMS to backend APIs yet.
5. Keep CMS state local-only using the CMS store + localStorage key.
6. Do not modify shared page-builder components for CMS-only features; keep behavior isolated in CMS files for easy revert.

---

## Product Scope

The CMS app is a standalone visual display editor for TV/signage style content.

Current behavior:

1. Route: `/cms` (standalone page, not inside admin layout shell).
2. Admin sidebar links to CMS with label `Content Management`.
3. Canvas is freeform absolute positioning.
4. Right panel switches mode:
   - If a block is selected: show block settings.
   - If no block is selected: show CMS library.

---

## Technical Boundaries

### Keep CMS isolated

Use only these areas for CMS changes:

1. `app/cms/*`
2. `app/components/admin/display/*`
3. `app/stores/displayStore.ts`
4. `app/routes/cms.tsx`
5. Admin navigation link wiring only

Avoid touching:

1. `app/editor/*`
2. `app/stores/editorStore.ts`
3. Existing page-builder section/group/block editor contracts
4. Shared block component behavior when the requirement is CMS-only

### Persistence

1. Storage key: `asb-cms-display`
2. Legacy fallback key supported: `asb-tv-display`
3. No server save calls for CMS state

---

## CMS Architecture

### Page composition

`CmsEditorPage` composes:

1. Header controls
2. Center `CMSCanvas`
3. Right `CMSSidebar`
4. Optional left overview panel

### Sidebar behavior

`CMSSidebar`:

1. Selected block exists -> `CMSBlockSettings`
2. No selected block -> `CMSLibrary`

### Library behavior

`CMSLibrary`:

1. Grid layout for block picker (not list rows)
2. Categories: Basic, Media, Layout, Content
3. No "Add to canvas" helper text
4. Includes canvas background settings panel

### Canvas behavior

`CMSCanvas`:

1. Fixed resolution canvas scaled to viewport
2. Drag blocks by pointer, including outside canvas bounds
3. Resize block containers by dragging edges and corners (8 handles)
4. Block positions and dimensions (`x`, `y`, `w`, `h`) are stored as canvas percentages
5. Orientation switch (landscape/portrait) supported in header
6. Selected block supports horizontal/vertical content alignment inside its own container in settings
7. Alignment controls in settings use icon-only buttons (with accessible labels), not text labels

---

## Store Contract (`displayStore.ts`)

CMS state is managed by `useDisplayStore` (Zustand + Immer), separate from page builder store.

Key state includes:

1. `resolution`
2. `zoom`
3. `blocks`
4. `selectedBlockId`
5. `activeTemplateId`
6. `canvasBackground` (`color | image | video`)
7. `globalStyle`

Key actions include:

1. `addBlock`
2. `removeBlock`
3. `updateBlock`
4. `selectBlock`
5. `setResolution`
6. `setZoom`
7. `setCanvasBackground`
8. `applyTemplate`
9. `resetCanvas`
10. `saveToLocalStorage`
11. `loadFromLocalStorage`

---

## Free Canvas Resizing Rules

Because CMS is a free canvas editor, each block has a resizable container.

Rules:

1. Resize must work from edges and corners.
2. Resizing updates container width and height, not only content style.
3. Width and height are persisted as percentages for responsive scaling across resolutions.
4. Images and videos must visually resize with the container when dragged.
5. Dragging is not edge-clamped: `x`/`y` can move outside 0-100 so blocks may be placed off-canvas.
6. Alignment controls support quick horizontal (`left|center|right`) and vertical (`top|middle|bottom`) content placement inside each block container.
7. Keep this behavior CMS-only; do not port to page-builder editor modes.

---

## Block Rules

Allowed CMS blocks (visual-only):

1. `heading`
2. `text`
3. `badge`
4. `list`
5. `image`
6. `video`
7. `icon`
8. `spacer`
9. `divider`
10. `card`
11. `quote`
12. `date`
13. `countdown`
14. `timeline`

Excluded from CMS:

1. `button`
2. `rsvp`

Terminology:

1. Use `CMS*` naming (not `Tv*` naming).

---

## Template System

Templates are local CMS presets that inject prefilled blocks into canvas.

Current pattern:

1. Template catalog: `CMS_TEMPLATE_LIBRARY`
2. Header template select uses shadcn `Select`
3. Applying a template replaces current blocks (with confirmation if canvas is not empty)
4. Templates can include stock image/video URLs
5. `activeTemplateId` is persisted

---

## Canvas Background Settings

Canvas background has dedicated CMS settings:

1. Type: `color`, `image`, or `video`
2. `color`: hex value via color picker
3. `image`: URL
4. `video`: URL

Rendering rules:

1. Background renders behind all blocks
2. Image uses cover behavior
3. Video background autoplays, muted, looped, no controls

---

## Video Behavior in CMS

For CMS-rendered `video` blocks:

1. `autoPlay: true`
2. `controls: false`
3. `muted: true`
4. `loop: true`

This behavior is CMS-context specific and should not unintentionally change normal page builder behavior.

---

## Typography In CMS

Font selection is supported for all CMS blocks with text content.

Rules:

1. Use the same font library and typography modal pattern as the main editor.
2. Text-bearing CMS blocks expose a Font Family selector in block settings.
3. Timeline exposes two selectors:
   - `fontFamily` for title text
   - `secondaryFontFamily` for subtitle + description text
4. Store block font overrides on `BlockStyle`:
   - `fontFamily`
   - `secondaryFontFamily` (timeline only)
5. Keep implementation CMS-only (settings + CMS renderer wiring), so page builder editor files remain unchanged.

---

## UI Controls Standard

In CMS, dropdown controls should use shadcn `Select` (not native `<select>`):

1. Template selector
2. Resolution selector
3. Background type selector
4. Typography uses the same modal + font library pattern as editor typography settings

---

## Prompting Checklist (For Future CMS Tasks)

When creating a CMS prompt, include these constraints:

1. "Work only in CMS files (`app/cms`, `app/components/admin/display`, `app/stores/displayStore.ts`)."
2. "Do not modify page builder editor (`app/editor/*`, `editorStore.ts`)."
3. "No backend integration. Keep CMS localStorage-only."
4. "Preserve right-panel mode switch: selected block -> settings, no selection -> library."
5. "Preserve free canvas absolute-position model."
6. "Use shadcn components for dropdown/select inputs."

---

## Example Prompt Starter

```md
Implement this feature in the CMS app only.

Constraints:
1. Do not modify `app/editor/*` or `app/stores/editorStore.ts`.
2. Keep CMS state local-only in `useDisplayStore` (`asb-cms-display`).
3. Preserve CMS architecture: standalone `/cms` page, free canvas, right panel mode switch.
4. Use shadcn UI components for new selects/dropdowns.
5. Keep naming in CMS domain (`CMS*`), not TV naming.

Feature request:
[describe feature]
```

---

## Current Status Summary

As of this guide version:

1. CMS is available at `/cms`.
2. CMS uses isolated store and local persistence.
3. CMS supports template injection with prefilled stock media.
4. CMS supports background settings (color/image/video).
5. CMS video playback defaults to autoplay/muted/loop without controls.
6. CMS library uses grid cards.
7. CMS blocks support drag-resize containers using edge/corner handles.
8. CMS text blocks support font-family selection via Typography Settings modal.
9. CMS blocks can be dragged outside canvas bounds (no edge clamp on drag).
10. CMS block settings include horizontal and vertical alignment controls for content placement inside block containers.
