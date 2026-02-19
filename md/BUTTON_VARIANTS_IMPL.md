# Button Variants & Icon Support — Implementation Plan

> **Status:** Ready to implement
> **Scope:** Self-contained — no store changes, no schema migration, no new routes.

---

## What We're Building

Four button style variants + optional left/right icon slots for the `button` block type.

```
[→ arrow_forward]  [Get Started]   ← iconLeft + text
[Get Started]  [open_in_new →]     ← text + iconRight
```

### Variant Reference

| Variant   | Look                                      | Use Case                    |
|-----------|-------------------------------------------|-----------------------------|
| `solid`   | Filled accent bg, white text              | Primary CTA (current default) |
| `outline` | Transparent bg, 2px accent border         | Secondary CTA               |
| `ghost`   | Accent-tinted bg (~7% opacity), accent text | Tertiary / soft action    |
| `link`    | Plain text + underline, no padding        | Inline / nav / subtle link  |

---

## Files Changed

| File | Type of Change |
|------|---------------|
| `app/blocks/ButtonBlock.tsx` | Rewrite — variant branching + icon rendering |
| `app/config/blockRegistry.ts` | Update button entry — new defaultProps + editableProps |
| `app/components/controls/FieldRenderer.tsx` | Add `select` case handler (currently unimplemented) |
| `app/md/ASB_PROMPT_GUIDE.md` | Update button block documentation |

### Files NOT Changed

- `app/types/editor.ts` — variant/icon live in `block.props`, not `BlockStyle`
- `app/stores/editorStore.ts` — no new state needed
- Section registry, layout code, or canvas rendering logic

---

## Data Model

Variant and icons go in `block.props` (not `BlockStyle`), because they change
what kind of element is rendered — not just a visual tweak to an existing shape.

```typescript
// button block.props shape (after change)
{
  text: string;                                    // "Get Started"
  url: string;                                     // "#"
  variant: "solid" | "outline" | "ghost" | "link"; // default: "solid"
  iconLeft?: string;   // Material Symbol name, e.g. "arrow_forward" — "" = no icon
  iconRight?: string;  // Material Symbol name, e.g. "open_in_new"   — "" = no icon
}
```

**Why props, not style?**
- `block.style` holds constrained visual overrides (size, alignment, color, opacity)
- `variant` changes the rendering branch entirely — it's an identity choice, not a tweak
- This keeps style inheritance clean (accentColor still drives all 4 variants)

---

## Step 1 — `FieldRenderer.tsx`: Wire up the `select` case

`"select"` is already defined in `ControlType` but the switch has no handler for it.
Add a native `<select>` that renders `field.options[]`.

```tsx
case "select":
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
      <select
        value={value as string || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
      >
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
```

---

## Step 2 — `ButtonBlock.tsx`: Variant rendering + icon slots

Read `variant`, `iconLeft`, `iconRight` from `block.props`.
Branch on variant to produce the right className + inline style combination.
Render icon spans (`material-symbols-outlined`) inside the `<a>`, sized to `block.style.fontSize`.

### Variant style matrix

```
solid:   bg=accentColor     border=none         text=white
outline: bg=transparent     border=2px accent   text=accentColor
ghost:   bg=accentColor+12  border=none         text=accentColor  (12 = ~7% hex alpha)
link:    bg=none            border=none         text=accentColor  underline, px-0 py-0
```

### Icon rendering rules
- Icon size tracks `block.style.fontSize` via a size map (sm→16, base→18, lg→20, xl→22px)
- `iconLeft` renders before button text, `iconRight` renders after
- Empty string `""` = no icon rendered (falsy check)
- `gap-2` between icon and text for solid/outline/ghost; `gap-1.5` for link

---

## Step 3 — `blockRegistry.ts`: Update button entry

### defaultProps additions
```typescript
defaultProps: {
  text: "Get Started",
  url: "#",
  variant: "solid",   // ← new, default preserves all existing buttons
  iconLeft: "",       // ← new, empty = no icon
  iconRight: "",      // ← new, empty = no icon
},
```

### editableProps additions (3 new fields after existing url field)
```typescript
{
  key: "variant",
  label: "Style",
  type: "select",
  options: [
    { label: "Solid",   value: "solid"   },
    { label: "Outline", value: "outline" },
    { label: "Ghost",   value: "ghost"   },
    { label: "Link",    value: "link"    },
  ],
},
{ key: "iconLeft",  label: "Icon (Left)",  type: "short-text" },
{ key: "iconRight", label: "Icon (Right)", type: "short-text" },
```

---

## Sidebar UX (Block Mode — Content Panel)

```
▼ CONTENT
  Button Text   [Get Started_____________]
  Button Link   [#_______________________]
  Style         [Solid ▾               ]   ← select dropdown
  Icon (Left)   [_______________________]   ← Material Symbol name (e.g. "bolt")
  Icon (Right)  [arrow_forward__________]   ← empty = no icon

▼ STYLE
  Size   [S][M][L]
  Align  [←][↕][→]
```

> **Note on icons:** Fields use `short-text` (user types a Material Symbol name).
> Future upgrade path: replace with `icon-picker` control once that control is built.
> Valid names: any string from fonts.google.com/icons (e.g. `arrow_forward`, `open_in_new`, `bolt`, `star`).

---

## Migration / Backward Compatibility

**No migration needed.** Existing button blocks that don't have `variant` in their props
will evaluate `variant = block.props.variant ?? "solid"` via default destructuring.
This preserves 100% of existing solid buttons exactly as they are.

---

## Testing Checklist

- [ ] Solid button renders same as before (no regression)
- [ ] Outline button shows accent border + accent text, transparent bg
- [ ] Ghost button shows subtle tinted background + accent text
- [ ] Link variant has no padding, shows underline, accent text
- [ ] `iconLeft` renders icon before text with correct size
- [ ] `iconRight` renders icon after text with correct size
- [ ] Both icons together work
- [ ] Empty icon fields render nothing
- [ ] All variants respond to `sectionStyle.accentColor` override
- [ ] All variants respond to `globalStyle.primaryColor` fallback
- [ ] `globalStyle.borderRadius` affects solid/outline/ghost (not link)
- [ ] `isEditing=true` still prevents link navigation
- [ ] Light theme (`globalStyle.themeMode === "light"`) looks correct for all variants
- [ ] Mobile layout renders correctly for all variants

---

## Future Improvements (not in this plan)

- Replace `short-text` icon fields with a proper `icon-picker` control (searchable grid)
- Add `secondaryButton` composite block (two buttons side-by-side) as a block variant
- Add `fullWidth` toggle (`w-full` instead of `inline-flex`) for hero-style CTA sections

---

*Plan version: 1.0 — February 2026*
