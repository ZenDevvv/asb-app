# ASB Design System — Style Guide

## Overview

This style guide defines the visual language and component patterns for the ASB application. It is built on **shadcn/ui** (new-york style), **Tailwind CSS v4**, **Framer Motion**, and **Google Material Symbols** for iconography. All colors are sourced from `app/app.css` using OKLCH color space with CSS custom properties.

---

## Color System

All colors are defined as CSS custom properties in `app/app.css`. Reference them via Tailwind's semantic tokens — **never hardcode OKLCH values** in component files.

### Core Palette

| Token                | Usage                          | Tailwind Class Example         |
| -------------------- | ------------------------------ | ------------------------------ |
| `--background`       | Page / app background          | `bg-background`                |
| `--foreground`       | Primary text                   | `text-foreground`              |
| `--card`             | Card / panel surfaces          | `bg-card`                      |
| `--card-foreground`  | Text on cards                  | `text-card-foreground`         |
| `--primary`          | Buttons, links, active states  | `bg-primary text-primary-foreground` |
| `--secondary`        | Secondary buttons / surfaces   | `bg-secondary text-secondary-foreground` |
| `--muted`            | Disabled / subtle backgrounds  | `bg-muted text-muted-foreground` |
| `--accent`           | Highlights, badges, emphasis   | `bg-accent text-accent-foreground` |
| `--destructive`      | Errors, delete actions         | `bg-destructive`               |
| `--border`           | Borders, dividers              | `border-border`                |
| `--input`            | Input field backgrounds        | `bg-input`                     |
| `--ring`             | Focus rings                    | `ring-ring`                    |

### Chart Colors

| Token       | Tailwind Class   |
| ----------- | ---------------- |
| `--chart-1` | `bg-chart-1`     |
| `--chart-2` | `bg-chart-2`     |
| `--chart-3` | `bg-chart-3`     |
| `--chart-4` | `bg-chart-4`     |
| `--chart-5` | `bg-chart-5`     |

### Sidebar Colors

| Token                          | Tailwind Class                  |
| ------------------------------ | ------------------------------- |
| `--sidebar`                    | `bg-sidebar`                    |
| `--sidebar-foreground`         | `text-sidebar-foreground`       |
| `--sidebar-primary`            | `bg-sidebar-primary`            |
| `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` |
| `--sidebar-accent`             | `bg-sidebar-accent`             |
| `--sidebar-accent-foreground`  | `text-sidebar-accent-foreground` |
| `--sidebar-border`             | `border-sidebar-border`         |
| `--sidebar-ring`               | `ring-sidebar-ring`             |

### Theme Modes

- **Dark mode** (default): Defined in `:root` and `.dark` — deep teal-black background with bright cyan accents.
- **Light mode**: Defined in `.light` — light teal-tinted background with deeper cyan accents.

---

## Typography

### Font Family

```
Inter, ui-sans-serif, system-ui, sans-serif
```

Configured in `app.css` via `--font-sans`. All UI text uses this family.

### Type Scale

| Role            | Class                                           | Usage                              |
| --------------- | ----------------------------------------------- | ---------------------------------- |
| Page title      | `text-3xl font-bold tracking-tight`             | Main headings, hero titles         |
| Section title   | `text-2xl font-bold tracking-tight`             | Section headers                    |
| Card title      | `text-xl font-semibold`                         | Card headers                       |
| Subtitle        | `text-lg font-medium`                           | Sub-headers, dialog titles         |
| Body            | `text-base` or `text-sm`                        | General content                    |
| Caption / Label | `text-xs font-medium uppercase tracking-widest` | Form labels, step indicators, tags |
| Muted text      | `text-sm text-muted-foreground`                 | Descriptions, secondary info       |

### Emphasis & Highlights

For highlighted keywords (as seen in headings like "primary goal"), use:

```tsx
<span className="text-primary font-bold italic">highlighted text</span>
```

---

## Border Radius

The global border radius is `rounded-2xl` (`1rem`). Apply this consistently across all interactive and container elements.

| Element          | Radius Class   |
| ---------------- | -------------- |
| Cards            | `rounded-2xl`  |
| Dialogs / Modals | `rounded-2xl`  |
| Buttons          | `rounded-2xl`  |
| Inputs           | `rounded-2xl`  |
| Dropdowns        | `rounded-2xl`  |
| Badges           | `rounded-full` |
| Avatars          | `rounded-full` |
| Tooltips         | `rounded-xl`   |

---

## Iconography — Google Material Symbols

Use **Google Material Symbols (Outlined)** for all icons. Import via CDN in `root.tsx`:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
```

### Icon Component

```tsx
interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
}

function MaterialIcon({ name, className, size = 20, filled = false }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
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

### Usage

```tsx
<MaterialIcon name="check_circle" className="text-primary" filled />
<MaterialIcon name="arrow_forward" size={16} />
<MaterialIcon name="shopping_bag" className="text-muted-foreground" />
```

### Common Icons Reference

| Context          | Icon Name            |
| ---------------- | -------------------- |
| Navigation back  | `arrow_back`         |
| Navigation next  | `arrow_forward`      |
| Close / Dismiss  | `close`              |
| Settings         | `settings`           |
| Search           | `search`             |
| User / Account   | `person`             |
| Dashboard        | `dashboard`          |
| Add / Create     | `add`                |
| Edit             | `edit`               |
| Delete           | `delete`             |
| Success / Check  | `check_circle`       |
| Error / Warning  | `error`              |
| Info             | `info`               |
| Visibility       | `visibility`         |
| Visibility off   | `visibility_off`     |
| Upload           | `upload`             |
| Download         | `download`           |
| Filter           | `filter_list`        |
| Sort             | `sort`               |
| Menu             | `menu`               |
| More options     | `more_vert`          |
| Sparkle / AI     | `auto_awesome`       |
| Globe            | `language`           |
| Lock             | `lock`               |
| Mail             | `mail`               |
| Help             | `help`               |
| Leads            | `person_add`         |
| Products         | `shopping_bag`       |
| Portfolio        | `grid_view`          |
| Brand            | `draw`               |

---

## Component Patterns

### Buttons

All buttons use `rounded-2xl`. The primary CTA button uses a gradient/glow cyan style.

```tsx
// Primary (CTA) — bright cyan
<Button className="rounded-2xl">
  <MaterialIcon name="auto_awesome" size={16} />
  Generate
</Button>

// Secondary
<Button variant="secondary" className="rounded-2xl">Cancel</Button>

// Outline
<Button variant="outline" className="rounded-2xl">Skip to Editor</Button>

// Ghost
<Button variant="ghost" className="rounded-2xl">
  <MaterialIcon name="arrow_back" size={16} />
  Back to previous step
</Button>

// Destructive
<Button variant="destructive" className="rounded-2xl">Delete</Button>

// Link
<Button variant="link">Forgot password?</Button>

// Icon-only
<Button variant="ghost" size="icon" className="rounded-2xl">
  <MaterialIcon name="more_vert" size={20} />
</Button>
```

### Full-Width CTA

For auth pages and important actions, use a full-width primary button:

```tsx
<Button className="w-full rounded-2xl h-12 text-base font-semibold">
  Create Account
  <MaterialIcon name="arrow_forward" size={18} />
</Button>
```

### Inputs

All inputs use `rounded-2xl` with an icon prefix where appropriate.

```tsx
// Standard input
<Input className="rounded-2xl" placeholder="name@company.com" />

// With icon prefix (wrap in a relative container)
<div className="relative">
  <MaterialIcon
    name="mail"
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
  />
  <Input className="rounded-2xl pl-10" placeholder="name@company.com" />
</div>

// Password input with lock icon
<div className="relative">
  <MaterialIcon
    name="lock"
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
  />
  <Input type="password" className="rounded-2xl pl-10" placeholder="Min. 8 characters" />
</div>
```

### Cards

Cards use `rounded-2xl` with a subtle border. For selection cards (like goal selection), add hover and active states.

```tsx
// Standard card
<Card className="rounded-2xl border border-border">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>

// Selection card (interactive)
<Card className="rounded-2xl border border-border hover:border-primary/50 cursor-pointer transition-colors">
  <CardContent className="pt-6">
    <div className="mb-4 inline-flex items-center justify-center size-12 rounded-2xl border border-border">
      <MaterialIcon name="person_add" className="text-primary" />
    </div>
    <h3 className="font-semibold mb-2">Get Leads</h3>
    <p className="text-sm text-muted-foreground">
      Capture visitor information with optimized forms and compelling lead magnets.
    </p>
  </CardContent>
</Card>

// Glass-effect card (for modals / overlays)
<Card className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
  {/* content */}
</Card>
```

### Badges & Tags

```tsx
// Status badge (e.g., "V2.0 Now Available")
<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
  <span className="size-1.5 rounded-full bg-primary" />
  V2.0 Now Available
</span>

// Suggestion chips
<button className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
  Landing Page for SaaS
</button>
```

### Form Labels

Use uppercase, tracked labels with primary color:

```tsx
<label className="text-xs font-medium uppercase tracking-widest text-primary">
  Your Name
</label>
```

### Dividers with Text

```tsx
<div className="flex items-center gap-4">
  <div className="h-px flex-1 bg-border" />
  <span className="text-xs uppercase tracking-widest text-muted-foreground">
    Or sign up with email
  </span>
  <div className="h-px flex-1 bg-border" />
</div>
```

### Social Login Button

```tsx
<Button variant="outline" className="w-full rounded-2xl h-12 text-base font-medium">
  <img src="/google-icon.svg" alt="Google" className="size-5" />
  Continue with Google
</Button>
```

### Admin Table + Pagination (Templates/Users)

Use this exact shell for admin listing pages to keep `templates` and `users` consistent.

```tsx
<section className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[960px] border-separate border-spacing-0">
      <thead className="bg-sidebar-accent/65">
        <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {/* th cells */}
        </tr>
      </thead>
      <tbody>
        {/* rows */}
      </tbody>
    </table>
  </div>
</section>
```

```tsx
<footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
  <p className="text-sm text-muted-foreground">
    Showing <span className="font-semibold text-foreground">1</span> to{" "}
    <span className="font-semibold text-foreground">10</span> of{" "}
    <span className="font-semibold text-foreground">100</span> items
  </p>

  <div className="flex items-center gap-2">
    <button
      type="button"
      className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Previous
    </button>
    <button
      type="button"
      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-card/80"
    >
      Next
    </button>
  </div>
</footer>
```

---

## Layout Patterns

### Auth Pages (Split Layout)

Auth pages use a two-column split: left panel for branding/context, right panel for the form.

```tsx
<div className="flex min-h-screen">
  {/* Left — Branding */}
  <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 bg-card border-r border-border">
    {/* Logo, tagline, form preview */}
  </div>

  {/* Right — Auth form */}
  <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
    <div className="w-full max-w-md space-y-6">
      {/* Form content */}
    </div>
  </div>
</div>
```

### Centered Login (Simple)

For simpler login pages, center a single card:

```tsx
<div className="flex min-h-screen items-center justify-center bg-background p-4">
  <Card className="w-full max-w-md rounded-2xl border border-border/50 p-8">
    {/* Login form */}
  </Card>
</div>
```

### Step Wizard Layout

For onboarding / multi-step flows:

```tsx
<div className="min-h-screen bg-background">
  {/* Top bar */}
  <header className="flex items-center justify-between p-6">
    <div className="flex items-center gap-3">
      <MaterialIcon name="auto_awesome" className="text-primary" />
      <div>
        <p className="text-xs uppercase tracking-widest text-primary">Step 2 of 4</p>
        <p className="text-sm font-medium">Goal Selection</p>
      </div>
    </div>
    <Button variant="ghost" className="rounded-2xl">
      Skip to Editor
      <MaterialIcon name="arrow_forward" size={16} />
    </Button>
  </header>

  {/* Step content */}
  <main className="mx-auto max-w-5xl px-6 py-16 text-center">
    {/* ... */}
  </main>

  {/* Back navigation */}
  <footer className="flex justify-center py-8">
    <Button variant="ghost" className="text-muted-foreground">
      <MaterialIcon name="arrow_back" size={16} />
      Back to previous step
    </Button>
  </footer>
</div>
```

---

## Progress & Loading States

### Step Progress List

Used in generation/building flows:

```tsx
<div className="space-y-4">
  {/* Completed step */}
  <div className="flex items-start gap-3">
    <MaterialIcon name="check_circle" className="text-primary mt-0.5" filled />
    <div className="flex-1">
      <p className="font-semibold text-sm">Analyzing prompt context</p>
      <p className="text-xs text-muted-foreground">Found key entities: "SaaS", "Modern"</p>
    </div>
    <span className="text-xs text-muted-foreground font-mono">0.4s</span>
  </div>

  {/* Active step */}
  <div className="flex items-start gap-3">
    <MaterialIcon name="progress_activity" className="text-primary animate-spin mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold text-sm">Drafting Hero section copy...</p>
      <div className="mt-2 rounded-xl bg-muted/50 border border-border p-3">
        <code className="text-xs text-primary">"Build faster with AI-powered..."</code>
      </div>
    </div>
  </div>

  {/* Pending step */}
  <div className="flex items-start gap-3 opacity-50">
    <MaterialIcon name="circle" size={20} className="text-muted-foreground mt-0.5" />
    <p className="text-sm">Selecting imagery</p>
  </div>
</div>
```

### Circular Progress

```tsx
<div className="relative size-16">
  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="2" />
    <circle
      cx="18" cy="18" r="16" fill="none"
      className="stroke-primary"
      strokeWidth="2"
      strokeDasharray="100"
      strokeDashoffset={100 - progress}
      strokeLinecap="round"
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
    {progress}%
  </span>
</div>
```

---

## Spacing & Grid

| Spacing Context           | Value          |
| ------------------------- | -------------- |
| Page padding              | `p-6` or `p-8` |
| Section gap               | `gap-8` to `gap-12` |
| Card internal padding     | `p-6`         |
| Form field gap            | `gap-4`       |
| Button internal gap       | `gap-2`       |
| Inline icon + text gap    | `gap-1.5` to `gap-2` |
| Grid columns (selection)  | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |

---

## Animation & Transitions

Use **Framer Motion** for entrance animations and state transitions.

### Default Transition

```tsx
const defaultTransition = { duration: 0.3, ease: "easeOut" };
```

### Fade-in-up (page/card entry)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  {/* content */}
</motion.div>
```

### Stagger children

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } },
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {/* item content */}
    </motion.div>
  ))}
</motion.div>
```

### Admin Data Surfaces (Users Page Pattern)

For dense admin views (stats + table), use lightweight staggered reveals instead of heavy choreography:

- **Summary cards:** `y: 12`, `duration: 0.28`, `delay: index * 0.05`
- **Table rows:** `y: 10`, `duration: 0.24`, `delay: index * 0.03`
- Keep easing `easeOut` for both

```tsx
{summaryCards.map((card, index) => (
  <motion.article
    key={card.title}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
  >
    {/* card */}
  </motion.article>
))}
```

```tsx
{pagedUsers.map((user, index) => (
  <motion.tr
    key={user.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24, delay: index * 0.03, ease: "easeOut" }}
  >
    {/* row cells */}
  </motion.tr>
))}
```

### Async Feedback Motion

For fetch/reload affordances (like Users page `Sync`), use icon spin tied directly to network state.

```tsx
<Icon
  name="refresh"
  size={16}
  className={cn(isFetching ? "animate-spin" : undefined)}
/>
```

### Hover scale (interactive cards)

```tsx
<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
  {/* card */}
</motion.div>
```

### CSS transitions (simple states)

For basic hover/focus transitions, prefer Tailwind's `transition-colors`, `transition-all`, or `transition-transform` over Framer Motion.

---

## Shadows & Depth

| Level     | Class                  | Usage                      |
| --------- | ---------------------- | -------------------------- |
| Subtle    | `shadow-xs`            | Buttons, inputs            |
| Low       | `shadow-sm`            | Cards at rest              |
| Medium    | `shadow-md`            | Elevated cards, dropdowns  |
| High      | `shadow-lg`            | Modals, dialogs            |
| Glow      | `shadow-[0_0_20px_rgba(0,255,200,0.15)]` | Primary CTA emphasis |

---

## Scrollbar

Use the `.minimal-scrollbar` utility class defined in `app.css` for scroll containers:

```tsx
<div className="overflow-y-auto minimal-scrollbar">
  {/* scrollable content */}
</div>
```

---

## Do's and Don'ts

### Do

- Use semantic color tokens (`bg-primary`, `text-foreground`) — never hardcode OKLCH values.
- Apply `rounded-2xl` consistently on all containers, buttons, inputs, and interactive elements.
- Use Google Material Symbols for all iconography.
- Maintain generous spacing — the design is spacious and breathable.
- Use subtle borders (`border border-border`) on cards for depth.
- Add smooth transitions on interactive elements.

### Don't

- Don't use Lucide icons — migrate to Google Material Symbols.
- Don't use `rounded-md` or `rounded-lg` on primary UI elements — always `rounded-2xl`.
- Don't hardcode colors outside the CSS variable system.
- Don't over-shadow — the design relies on borders and subtle surface differences, not heavy shadows.
- Don't use pure black (`#000`) or pure white (`#fff`) — all neutrals have a teal tint.
