# ALMA Styling Guide

This document defines the visual language, component patterns, and coding conventions for the ALMA platform UI. Every new page, feature, or component **must** follow these rules.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Icons — Google Material Symbols](#icons--google-material-symbols)
5. [Spacing & Layout](#spacing--layout)
6. [Component Patterns](#component-patterns)
7. [Charts — Recharts](#charts--recharts)
8. [Dark Mode](#dark-mode)
9. [Do's and Don'ts](#dos-and-donts)

---

## Design Principles

| Principle | Rule |
|---|---|
| **Modern & Minimal** | Favor whitespace over decoration. Every element must earn its place. |
| **Brand-first color** | Use **only** CSS custom properties from `app/app.css`. No arbitrary hex/rgb values. |
| **Neumorphism cards** | Cards use the `.neumorphism` utility (soft inset/outset shadows) with `rounded-3xl`. |
| **Consistency** | Reuse shadcn/ui primitives. Never create a one-off styled `<div>` when a component exists. |
| **Responsive** | Mobile-first. Use Tailwind breakpoints (`sm`, `md`, `lg`, `xl`). |

---

## Color System

All colors are defined as CSS variables in `app/app.css` and exposed through the `@theme inline` block. **Always use Tailwind's semantic token classes** — never hard-code color values.

### Core Palette

| Token | Tailwind Class | Light Mode | Usage |
|---|---|---|---|
| `--primary` | `bg-primary` / `text-primary` | Dark blue `#285192` | Primary buttons, links, active states |
| `--primary-foreground` | `text-primary-foreground` | White | Text on primary backgrounds |
| `--secondary` | `bg-secondary` | Light blue-gray | Secondary buttons, subtle backgrounds |
| `--accent` | `bg-accent` / `text-accent` | Cyan/turquoise | Highlights, accent elements |
| `--muted` | `bg-muted` | Soft gray | Disabled backgrounds, subtle fills |
| `--muted-foreground` | `text-muted-foreground` | Mid gray-blue | Secondary text, descriptions |
| `--destructive` | `bg-destructive` | Red-orange | Error states, delete actions |
| `--background` | `bg-background` | Very light blue-gray | Page background |
| `--foreground` | `text-foreground` | Dark navy | Primary text |
| `--card` | `bg-card` | White | Card surfaces |
| `--border` | `border-border` | Light blue-gray | Borders, dividers |

### Chart / Accent Colors

Use these for data visualization and status accents:

| Token | Tailwind Class | Color | Suggested Use |
|---|---|---|---|
| `--chart-1` | `text-chart-1` | Dark Blue | Primary data series |
| `--chart-2` | `text-chart-2` | Cyan | Secondary data series |
| `--chart-3` | `text-chart-3` | Green `#76C043` | Success / positive |
| `--chart-4` | `text-chart-4` | Light Green `#A8D84E` | Tertiary data |
| `--chart-5` | `text-chart-5` | Mid Blue | Quaternary data |

### Status Colors (Semantic)

For badges and inline status indicators, compose from chart tokens or Tailwind's built-in palette **only when no CSS variable exists**:

```
Active   → bg-emerald-50 text-emerald-700  (dark: bg-emerald-950 text-emerald-400)
Pending  → bg-amber-50 text-amber-700      (dark: bg-amber-950 text-amber-400)
Inactive → bg-red-50 text-red-700          (dark: bg-red-950 text-red-400)
```

### Usage Rules

```tsx
// CORRECT — semantic token
<div className="bg-primary text-primary-foreground" />

// CORRECT — chart color for data viz
<div className="text-chart-3" />

// WRONG — arbitrary value
<div className="bg-[#285192]" />
<div style={{ color: "rgb(40, 81, 146)" }} />
```

---

## Typography

The app uses **Inter** as the primary sans-serif font (defined in `@theme`).

| Element | Tailwind Classes | Notes |
|---|---|---|
| Page title | `text-2xl font-bold tracking-tight text-foreground` | One per page |
| Page subtitle | `text-sm text-muted-foreground` | Below the title |
| Section heading | `text-lg font-semibold` | Card titles, section headers |
| Body text | `text-sm text-foreground` | Default readable text |
| Caption / helper | `text-xs text-muted-foreground` | Timestamps, helper text |
| Stat value | `text-3xl font-bold tracking-tight` | Dashboard KPI numbers |
| Table header | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` | Column headers |

### Rules

- **No `text-lg` or larger** for body copy — keep it `text-sm`.
- Use `tracking-tight` on large display numbers and titles.
- Use `font-semibold` for headings, `font-medium` for labels, `font-bold` for KPI numbers.

---

## Icons — Google Material Symbols

**Standard:** Use [Google Material Symbols](https://fonts.google.com/icons) via the `material-symbols-outlined` font or the `@material-symbols/font-400` npm package.

### Setup

Add to your root layout `<head>`:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
/>
```

Or install via npm:

```bash
npm install @material-symbols/font-400
```

### Usage Pattern

Create a reusable `Icon` component:

```tsx
// app/components/ui/icon.tsx
type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
};

export function Icon({ name, className = "", filled = false, size = 20 }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
}
```

### Common Icons

| Action | Icon Name | Example |
|---|---|---|
| Dashboard | `dashboard` | `<Icon name="dashboard" />` |
| Organizations | `apartment` | `<Icon name="apartment" />` |
| Users | `group` | `<Icon name="group" />` |
| Settings | `settings` | `<Icon name="settings" />` |
| Search | `search` | `<Icon name="search" />` |
| Add | `add` | `<Icon name="add" />` |
| Edit | `edit` | `<Icon name="edit" />` |
| Delete | `delete` | `<Icon name="delete" />` |
| Download | `download` | `<Icon name="download" />` |
| Refresh | `refresh` | `<Icon name="refresh" />` |
| More actions | `more_vert` | `<Icon name="more_vert" />` |
| Trending up | `trending_up` | `<Icon name="trending_up" />` |
| Health/heart | `monitor_heart` | `<Icon name="monitor_heart" />` |
| Notifications | `notifications` | `<Icon name="notifications" />` |
| Help | `help` | `<Icon name="help" />` |
| Audit/logs | `receipt_long` | `<Icon name="receipt_long" />` |
| Check circle | `check_circle` | `<Icon name="check_circle" />` |
| Warning | `warning` | `<Icon name="warning" />` |
| Error | `error` | `<Icon name="error" />` |
| Bar chart | `bar_chart` | `<Icon name="bar_chart" />` |

### Icon Sizing

| Context | Size | Example |
|---|---|---|
| Inline with text | `20` (default) | Body, labels |
| Button icon | `20` | Inside `<Button>` |
| Stat card icon | `24` | KPI icon badge |
| Empty state | `48` | Large illustrative icon |

### Rules

- **Never use Lucide, Heroicons, or Font Awesome** in new code. Migrate existing Lucide usages to Google Material Symbols when touching a file.
- Always use the **Outlined** variant for consistency.
- Use `filled` prop sparingly — only for active/selected nav items.

---

## Spacing & Layout

### Page Layout

```tsx
<div className="space-y-6">
  {/* Header: title + actions */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Page Title</h1>
      <p className="text-sm text-muted-foreground">Subtitle or description.</p>
    </div>
    <div className="flex items-center gap-3">
      {/* Action buttons */}
    </div>
  </div>

  {/* Content sections */}
</div>
```

### Grid System

| Pattern | Classes |
|---|---|
| Stat cards (4-up) | `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` |
| Two-column split (3/2) | `grid gap-6 lg:grid-cols-5` → `lg:col-span-3` + `lg:col-span-2` |
| Two-column equal | `grid gap-6 lg:grid-cols-2` |
| Three-column | `grid gap-6 lg:grid-cols-3` |

### Spacing Scale

| Usage | Value |
|---|---|
| Between page sections | `space-y-6` or `gap-6` |
| Between cards in a grid | `gap-4` |
| Card internal padding | `p-5` or `p-6` |
| Between list items | `py-4` with `divide-y` |
| Between label and value | `mt-1` to `mt-2` |
| Button group gap | `gap-3` |

---

## Component Patterns

### Cards (Neumorphism)

All cards use the custom `Card` component which applies `neumorphism` and `rounded-3xl` automatically.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card className="border-border/50">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Stat Cards

```tsx
<Card>
  <CardContent className="p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">Metric Name</p>
      <div className="rounded-lg p-2 bg-primary/10 text-primary">
        <Icon name="group" size={20} />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-3xl font-bold tracking-tight text-foreground">1,234</p>
      <div className="mt-1 flex items-center gap-1.5">
        <Icon name="trending_up" size={14} className="text-emerald-600" />
        <span className="text-xs font-medium text-emerald-600">+5% this month</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### Buttons

```tsx
// Primary action (filled)
<Button size="sm" className="gap-2">
  <Icon name="add" size={18} />
  New Organization
</Button>

// Secondary action (outline)
<Button variant="outline" size="sm" className="gap-2">
  <Icon name="download" size={18} />
  Export Report
</Button>

// Ghost (icon-only)
<Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
  <Icon name="more_vert" size={20} />
</Button>

// Link-style
<Button variant="link" size="sm" className="text-primary">
  View All
</Button>
```

### Badges (Status)

```tsx
// Active
<Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px]
  dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
  Active
</Badge>

// Pending
<Badge className="border-amber-200 bg-amber-50 text-amber-700 text-[11px]
  dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
  Pending
</Badge>

// Inactive
<Badge className="border-red-200 bg-red-50 text-red-700 text-[11px]
  dark:border-red-800 dark:bg-red-950 dark:text-red-400">
  Inactive
</Badge>
```

### Avatars (Initials)

```tsx
<Avatar className="size-10">
  <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
    RH
  </AvatarFallback>
</Avatar>
```

Recommended avatar background colors:

```
bg-blue-500, bg-violet-500, bg-emerald-500, bg-red-500,
bg-amber-500, bg-cyan-500, bg-pink-500, bg-indigo-500
```

### Progress Bars

```tsx
// Green (success)
<Progress
  value={99}
  className="h-2 bg-emerald-100 dark:bg-emerald-950
    [&>[data-slot=progress-indicator]]:bg-emerald-500"
/>

// Amber (warning)
<Progress
  value={45}
  className="h-2 bg-amber-100 dark:bg-amber-950
    [&>[data-slot=progress-indicator]]:bg-amber-500"
/>

// Primary (brand)
<Progress
  value={72}
  className="h-2 bg-primary/20
    [&>[data-slot=progress-indicator]]:bg-primary"
/>
```

### Tables (Inline)

For small data lists inside cards, use a CSS grid rather than `<table>`:

```tsx
{/* Header */}
<div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4
  border-b border-border/50 pb-3
  text-xs font-semibold uppercase tracking-wider text-muted-foreground">
  <span>Name</span>
  <span className="w-20 text-center">Status</span>
  <span className="w-20 text-center">Count</span>
  <span className="w-20 text-center">Date</span>
  <span className="w-10 text-center">Action</span>
</div>

{/* Rows */}
<div className="divide-y divide-border/40">
  {items.map(item => (
    <div key={item.id}
      className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 py-4
        transition-colors hover:bg-muted/30">
      {/* ... cells ... */}
    </div>
  ))}
</div>
```

For full-page data tables, use the shadcn `<Table>` component from `@/components/ui/table`.

---

## Charts — Recharts

Use [Recharts](https://recharts.org) for all data visualizations.

### Installation

```bash
npm install recharts
```

### Color Mapping

Always pull colors from CSS variables. Use this helper:

```tsx
// app/lib/chart-colors.ts
export const CHART_COLORS = {
  primary: "var(--chart-1)",   // Dark Blue
  cyan: "var(--chart-2)",      // Cyan/Turquoise
  green: "var(--chart-3)",     // Green
  lightGreen: "var(--chart-4)",// Light Green
  midBlue: "var(--chart-5)",   // Mid Blue
};
```

### Bar Chart Example

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

<Card>
  <CardHeader>
    <CardTitle>Monthly Overview</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="secondary" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### Line Chart Example

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
    <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
    <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
    <Tooltip
      contentStyle={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderRadius: "var(--radius)",
        fontSize: 12,
      }}
    />
    <Line
      type="monotone"
      dataKey="users"
      stroke="var(--chart-1)"
      strokeWidth={2}
      dot={false}
    />
    <Line
      type="monotone"
      dataKey="sessions"
      stroke="var(--chart-2)"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>
```

### Pie / Donut Chart Example

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)",
];

<ResponsiveContainer width="100%" height={200}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={80}
      dataKey="value"
      strokeWidth={0}
    >
      {data.map((_, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
</ResponsiveContainer>
```

### Chart Rules

- Always wrap charts in `<ResponsiveContainer width="100%" height={N}>`.
- Use `var(--chart-N)` for fills and strokes — never hard-code colors.
- Tooltips must use `var(--card)` background and `var(--border)` border.
- Use `radius={[4, 4, 0, 0]}` on bar charts for rounded top corners.
- Keep grid lines subtle with `className="stroke-border"`.
- Set `dot={false}` on line charts for cleaner look.

---

## Dark Mode

Dark mode is toggled via the `.dark` class on a parent element. All CSS variables automatically swap.

### Rules

- **Never** use raw colors like `bg-white` or `text-black` — always use semantic tokens (`bg-card`, `text-foreground`).
- For status badges, always include **both** light and dark variants:

  ```
  bg-emerald-50 dark:bg-emerald-950
  text-emerald-700 dark:text-emerald-400
  border-emerald-200 dark:border-emerald-800
  ```

- Progress bar tracks need both variants:

  ```
  bg-emerald-100 dark:bg-emerald-950
  ```

- Opacity-based borders work well in dark mode: `border-border/50`.

---

## Do's and Don'ts

### DO

- Use `bg-primary`, `text-foreground`, `border-border` and other CSS variable tokens.
- Use the `Card` component (with built-in neumorphism) for all content containers.
- Use `gap-*` and `space-y-*` for spacing — avoid margin hacks.
- Use `transition-colors` on interactive hover states.
- Keep cards at `border-border/50` for subtle borders.
- Use `text-[11px]` for tiny badge text.
- Use Google Material Symbols Outlined for all icons.
- Use Recharts for any chart or data visualization.
- Provide a `hover:bg-muted/30` on table rows.
- Use `divide-y divide-border/40` for list separators.

### DON'T

- Hard-code hex, rgb, or oklch values in components.
- Use Lucide, Heroicons, Font Awesome, or any other icon library in new code.
- Create custom shadow utilities — use the `neumorphism` class.
- Use `<table>` for small inline data — use CSS grid.
- Add decorative borders or dividers that don't serve hierarchy.
- Use more than 2 font weights in a single card.
- Nest cards inside cards.
- Use `!important` or inline styles (except for icon `fontVariationSettings`).
- Create chart visualizations without `ResponsiveContainer`.
- Use raw Tailwind colors (`bg-blue-600`) as the **primary** color — always prefer `bg-primary`.

---

## File Reference

| File | Purpose |
|---|---|
| `app/app.css` | All CSS custom properties (colors, radius, theme) |
| `app/components/ui/` | shadcn/ui primitives |
| `app/components/ui/icon.tsx` | Google Material Symbols wrapper (to be created) |
| `app/lib/chart-colors.ts` | Recharts color constants (to be created) |
| `components.json` | shadcn/ui configuration (New York style) |
