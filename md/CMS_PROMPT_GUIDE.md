# AI Prompt Context - CMS Mode Inside ASB

> Use this guide for CMS work inside AppSiteBuilder.
> CMS is no longer an isolated local-only tool. It is an admin-authored template mode backed by `TemplateProject`, with forked user instances persisted as `Project`.

---

## Core Rule (Do Not Break)

CMS and Website templates share one template system but must remain mode-separated.

1. Use `editorMode` on template documents to separate concerns.
2. `editorMode: "website"` templates belong to website editor flows.
3. `editorMode: "cms"` templates belong to CMS flows (admin template management + user fork-to-project flows).
4. Do not let website routes edit/render CMS templates.
5. Do not let public template view routes access CMS templates.

---

## Route Contract

Admin-only CMS routes:

1. `/admin/cms`
2. `/admin/cms/editor/:templateId`
3. `/admin/cms/view/:templateId`

User CMS project routes:

1. `/project/cms/:slug` (editable CMS project editor)
2. `/project/cms/view/:slug` (read-only CMS project view)

Layout ownership:

1. `/admin/cms` is rendered inside `AdminLayout`
2. `/admin/cms/editor/:templateId` is rendered outside `AdminLayout` (standalone editor shell)
3. `/admin/cms/view/:templateId` is rendered outside `AdminLayout` (standalone preview shell, admin-only)

Back-compat redirects:

1. `/cms` -> `/admin/cms`
2. `/admin/display` -> `/admin/cms`

Project mode redirects:

1. `/project/:slug` is the website editor route; if that slug belongs to a CMS-mode project, redirect silently to `/project/cms/:slug` (no alert).

---

## Data Contract

Template documents now include:

1. `editorMode: "website" | "cms"` (runtime fallback for legacy missing value -> `"website"`)
2. `cmsState: Json` for CMS canvas payload
3. `globalStyle: Json` shared by website and CMS modes

### `cmsState` contract (v1)

```ts
{
  version: 1,
  resolution: { label: string; width: number; height: number },
  zoom: number,
  blocks: CMSBlock[],
  activeTemplateId: string | null,
  canvasBackground: {
    type: "color" | "image" | "video",
    color: string,
    imageUrl: string,
    videoUrl: string,
  }
}
```

Server persistence excludes ephemeral selection state (`selectedBlockId`).

---

## Persistence Model

Source of truth for CMS templates:

1. Server `templateProject.cmsState`

Source of truth for CMS projects:

1. Server `project.cmsState`

Local resilience only:

1. Per-template draft cache key: `asb-cms-display:<templateId>` (admin template editor)
2. Per-project draft cache key: `project:<slug>` (user CMS project editor)
3. Local cache is fallback for network failures
4. No one-time import from legacy `asb-cms-display` snapshot

Store APIs:

1. `hydrateFromServer(...)`
2. `hydrateFromLocalDraft(...)`
3. `exportForServer()`
4. `saveDraftToLocalStorage(...)`

---

## Backend Authorization Rules

1. CMS template create/update/delete: admin only
2. CMS template reads: authenticated users allowed (admin/user/viewer)
3. CMS template public-access (`X-Public-Access`) reads: rejected
4. CMS template fork endpoint: allowed for authenticated non-viewer users
5. Website template behavior remains unchanged (website filters/routes still website-only)
6. List endpoint supports mode filtering: `filter=editorMode:cms` or `filter=editorMode:website`

---

## Frontend Mode Rules

1. Admin CMS list only requests `editorMode:cms`
2. User CMS template browser requests `editorMode:cms` and forks into CMS projects
3. Website admin/user/public flows request website mode (`editorMode:website` plus legacy null fallback)
4. Wrong-mode route access must redirect to the correct route:
   - CMS project opened via `/project/:slug` -> silently redirect to `/project/cms/:slug` (no alert)
   - Website project opened via `/project/cms/:slug` -> redirect to `/project/:slug`
   - CMS template in website template editor -> redirect to CMS admin editor
   - Website template in CMS template editor/view -> redirect to website editor

---

## CMS Editor Behavior

`/admin/cms/editor/:templateId` remains free-canvas CMS editing with:

1. Absolute-position drag (including outside canvas bounds)
2. 8-handle resize
3. Rotation
4. Percent geometry (`x`, `y`, `w`, `h`)
5. Canvas background (`color` | `image` | `video`)

Save behavior:

1. Debounced autosave (3s) to template API
2. Ctrl/Cmd+S immediate save
3. Save payload includes `cmsState + globalStyle`

---

## CMS Project Editor Behavior

`/project/cms/:slug` supports user editing of forked CMS projects with:

1. The same free-canvas interaction model as template CMS editor
2. Server persistence to `project.cmsState` + `globalStyle`
3. Local fallback draft key `project:<slug>`
4. Inline project rename in header
5. Rename uses project update endpoint and auto-syncs slug server-side when `slug` is omitted
6. If slug changes after rename, route replaces to `/project/cms/<newSlug>`

---

## Shared Core Reuse

CMS settings should reuse ASB editor block-settings internals where possible.

Use shared panel components:

1. `ContentPanel`
2. `StylePanel`
3. `ColorsPanel`
4. `SpacingPanel`
5. `VariantPanel`

Keep CMS-only panel logic for:

1. Position controls (`x`, `y`, `w`, `h`, `rotation`)
2. Container alignment controls for free-canvas blocks

---

## Prompting Checklist

When writing CMS prompts, include:

1. "CMS templates are admin-authored (`editorMode: cms`) and forkable by authenticated users into CMS projects."
2. "Persist CMS templates to `templateProject.cmsState` and forked CMS projects to `project.cmsState`; local cache is fallback only."
3. "Preserve CMS free-canvas behavior and percent geometry."
4. "Reuse shared editor block-settings panels before adding CMS-specific UI."
5. "Keep website and CMS template flows separated by `editorMode`."

---

## Current Status Summary

1. CMS template management lives at `/admin/cms`
2. CMS editor is template-bound at `/admin/cms/editor/:templateId` and rendered outside `AdminLayout`
3. CMS admin view route exists at `/admin/cms/view/:templateId`
4. Template schema includes `editorMode` and `cmsState`
5. Backend enforces admin-only CMS template mutations, blocks CMS public access, and allows authenticated user CMS forks
6. User CMS project editor/view routes exist at `/project/cms/:slug` and `/project/cms/view/:slug`
7. CMS projects can be renamed inline in `/project/cms/:slug`; slug auto-sync + route replacement is applied after rename
8. User project list opens CMS projects directly at `/project/cms/:slug`
9. Website template flows are filtered away from CMS templates by default

---

*Last Updated: March 4, 2026*
