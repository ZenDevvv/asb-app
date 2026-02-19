import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

// ─── Icon library ────────────────────────────────────────────────────────────

const ICON_CATEGORIES: Record<string, string[]> = {
  Arrows: [
    "arrow_forward", "arrow_back", "arrow_upward", "arrow_downward",
    "chevron_right", "chevron_left", "expand_more", "expand_less",
    "north_east", "south_east", "double_arrow", "trending_flat",
    "open_in_new", "launch",
  ],
  Actions: [
    "bolt", "check", "check_circle", "close", "add", "add_circle",
    "edit", "delete", "search", "settings", "tune", "more_horiz",
    "refresh", "download", "upload", "share", "send", "done", "done_all",
    "content_copy", "bookmark", "star", "star_border",
  ],
  Communication: [
    "email", "phone", "chat", "message", "notifications",
    "forum", "mail", "contact_mail", "phone_in_talk", "support_agent",
    "call", "sms", "videocam",
  ],
  Business: [
    "business", "storefront", "shopping_cart", "payments", "receipt",
    "analytics", "trending_up", "bar_chart", "pie_chart", "attach_money",
    "credit_card", "monetization_on", "work", "apartment", "inventory",
  ],
  People: [
    "person", "people", "group", "groups", "face", "public",
    "person_add", "manage_accounts", "account_circle", "verified_user",
    "supervisor_account", "badge",
  ],
  Media: [
    "play_arrow", "pause", "volume_up", "image", "video_library",
    "movie", "music_note", "mic", "camera", "photo_camera",
    "headphones", "podcast",
  ],
  Design: [
    "palette", "style", "auto_fix_high", "brush", "format_paint",
    "design_services", "color_lens", "draw", "format_shapes", "auto_awesome",
    "gradient", "texture",
  ],
  Tech: [
    "code", "terminal", "cloud", "devices", "smartphone", "computer",
    "wifi", "security", "lock", "shield", "api", "memory",
    "storage", "dns",
  ],
  Engagement: [
    "thumb_up", "favorite", "visibility", "comment", "rate_review",
    "celebration", "emoji_events", "military_tech", "trophy", "workspace_premium",
    "sentiment_satisfied", "local_fire_department",
  ],
  Navigation: [
    "home", "menu", "info", "help", "location_on", "map",
    "calendar_today", "schedule", "timer", "history",
    "explore", "flight",
  ],
};

const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();

// ─── Component ───────────────────────────────────────────────────────────────

interface IconPickerControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function IconPickerControl({ label, value, onChange }: IconPickerControlProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const hasIcon = Boolean(value);

  const handleSelect = (icon: string) => {
    onChange(icon);
    setOpen(false);
    setSearch("");
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setSearch("");
  };

  return (
    <>
      {/* Trigger button */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`group w-full flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs transition-colors text-left min-h-[34px] ${
            hasIcon
              ? "border-border bg-input/50 text-foreground hover:border-primary/40"
              : "border-dashed border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          }`}
        >
          {hasIcon ? (
            <>
              <span
                className="material-symbols-outlined shrink-0 text-primary"
                style={{ fontSize: 15 }}
              >
                {value}
              </span>
              <span className="flex-1 truncate text-[10px] leading-none">
                {value.replace(/_/g, " ")}
              </span>
              <span
                className="material-symbols-outlined shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ fontSize: 13 }}
              >
                edit
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: 14 }}>
                add
              </span>
              <span className="text-[10px] leading-none truncate">
                {label}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm bg-sidebar text-foreground border-sidebar-border p-0 gap-0"
        >
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-semibold text-sidebar-foreground">
                  Choose Icon
                </DialogTitle>
                <p className="text-[10px] uppercase tracking-widest text-primary mt-0.5">
                  {label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
          </DialogHeader>

          {/* Search */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                style={{ fontSize: 15 }}
              >
                search
              </span>
              <input
                autoFocus
                placeholder="Search icons…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-input/50 pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Icon grid */}
          <div className="overflow-y-auto max-h-64 minimal-scrollbar">
            {search.trim() ? (
              <SearchResults
                query={search}
                selected={value}
                onSelect={handleSelect}
              />
            ) : (
              <CategoryBrowser selected={value} onSelect={handleSelect} />
            )}
          </div>

          {/* Footer — remove */}
          {hasIcon && (
            <div className="px-4 py-3 border-t border-sidebar-border">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                Remove icon
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────

function SearchResults({
  query,
  selected,
  onSelect,
}: {
  query: string;
  selected: string;
  onSelect: (icon: string) => void;
}) {
  const term = query.trim().toLowerCase().replace(/\s+/g, "_");
  const matches = ALL_ICONS.filter((icon) => icon.includes(term));

  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No icons found for &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <div className="px-4 py-3">
      <IconGrid icons={matches} selected={selected} onSelect={onSelect} />
    </div>
  );
}

// ─── Category browser ─────────────────────────────────────────────────────────

function CategoryBrowser({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (icon: string) => void;
}) {
  return (
    <div className="px-4 py-3 space-y-4">
      {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
        <div key={category}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {category}
          </p>
          <IconGrid icons={icons} selected={selected} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

// ─── Icon grid ────────────────────────────────────────────────────────────────

function IconGrid({
  icons,
  selected,
  onSelect,
}: {
  icons: string[];
  selected: string;
  onSelect: (icon: string) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {icons.map((icon) => (
        <button
          key={icon}
          type="button"
          title={icon.replace(/_/g, " ")}
          onClick={() => onSelect(icon)}
          className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
            selected === icon
              ? "border-primary bg-primary/10 text-primary"
              : "border-transparent text-muted-foreground hover:border-sidebar-border hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {icon}
          </span>
        </button>
      ))}
    </div>
  );
}
