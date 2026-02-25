import { useState } from "react";
import type { BlockComponentProps } from "~/types/editor";
import { resolveAccentColor } from "~/lib/blockColors";

const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  full: "20px",
};

interface RsvpProps {
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  attendanceLabel?: string;
  acceptText?: string;
  declineText?: string;
  guestsLabel?: string;
  maxGuests?: string;
  submitText?: string;
  submitUrl?: string;
  // Two color settings — everything is derived from these
  bgColor?: string;
  fgColor?: string;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb;
  return 0.299 * r + 0.587 * g + 0.114 * b; // 0–255
}

function isDark(hex: string): boolean {
  return luminance(hex) < 128;
}

/** Shift each channel by `amount` (positive = lighter, negative = darker). */
function shiftHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map((c) => Math.max(0, Math.min(255, c + amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Mix hex color toward white (amount 0–1) or black (amount 0 to -1). */
function mixHex(hex: string, toward: "white" | "black", strength: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const target = toward === "white" ? 255 : 0;
  const [r, g, b] = rgb.map((c) => Math.round(c + (target - c) * strength));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RsvpBlock({ block, globalStyle, isEditing }: BlockComponentProps) {
  const [attending, setAttending] = useState<"accept" | "decline" | null>(null);
  const [guests, setGuests] = useState(1);

  const p = block.props as RsvpProps;
  const s = block.style;

  const themeIsDark = globalStyle.themeMode === "dark";
  const accentColor = resolveAccentColor(s, globalStyle);
  const radius = RADIUS_MAP[globalStyle.borderRadius || "md"] ?? "10px";
  const maxGuests = Math.max(1, Math.min(20, Number(p.maxGuests) || 10));

  // ── Background palette ─────────────────────────────────────────────────────
  // One base color; every surface in the block is derived from it.
  const baseBg = p.bgColor || (themeIsDark ? "#0d1526" : "#f4f5f7");
  const bgIsDark = isDark(baseBg);

  // Inputs sit one step deeper than the card surface
  const inputBg = bgIsDark
    ? mixHex(baseBg, "black", 0.25)
    : mixHex(baseBg, "white", 0.6);

  // Borders have just enough contrast to be visible
  const borderStrong = bgIsDark
    ? mixHex(baseBg, "white", 0.18)
    : mixHex(baseBg, "black", 0.18);

  const borderSubtle = bgIsDark
    ? mixHex(baseBg, "white", 0.1)
    : mixHex(baseBg, "black", 0.1);

  // ── Text palette ──────────────────────────────────────────────────────────
  // One base color; muted and label variants are derived from it.
  const baseText = p.fgColor || (bgIsDark ? "#ffffff" : "#111111");
  const textIsDark = isDark(baseText);

  // Labels: shift the text color slightly toward the accent so they pop
  // without being pure accent — gives a complementary feel
  const labelText = shiftHex(
    baseText,
    textIsDark ? -20 : 20, // push away from mid-gray
  );

  // Muted text for disabled/placeholder context (hex alpha suffix)
  const mutedText = `${baseText}66`;

  // ── Accent-derived tints for attendance buttons ───────────────────────────
  const accentTint = `${accentColor}1a`;
  const accentBorder = `${accentColor}45`;

  // Button text: must contrast against solid accentColor background
  const btnText = isDark(accentColor) ? "#ffffff" : "#000000";

  const guestLabel = guests === 1 ? "1 Guest" : `${guests} Guests`;

  const handleAttendClick = (value: "accept" | "decline") => {
    if (!isEditing) setAttending(value);
  };

  const handleGuestStep = (delta: number) => {
    if (isEditing) return;
    setGuests((prev) => Math.max(1, Math.min(maxGuests, prev + delta)));
  };

  // ── Shared styles ─────────────────────────────────────────────────────────

  const fieldLabelStyle: React.CSSProperties = {
    color: labelText,
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
    fontFamily: globalStyle.fontFamily,
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: inputBg,
    border: `1px solid ${borderStrong}`,
    borderRadius: radius,
    color: baseText,
    padding: "13px 16px",
    width: "100%",
    fontSize: "14px",
    fontFamily: globalStyle.fontFamily,
    outline: "none",
    boxSizing: "border-box",
  };

  const dividerStyle: React.CSSProperties = {
    border: "none",
    borderTop: `1px solid ${borderSubtle}`,
    margin: "26px 0",
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        backgroundColor: baseBg,
        border: `2px solid ${accentColor}`,
        borderRadius: radius,
        overflow: "hidden",
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: "32px 36px 36px" }}>

        {/* Name + Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={fieldLabelStyle}>{p.nameLabel || "Full Name"}</label>
            <input
              type="text"
              placeholder={p.namePlaceholder || "Guest Name"}
              style={inputStyle}
              readOnly={isEditing}
            />
          </div>
          <div>
            <label style={fieldLabelStyle}>{p.emailLabel || "Email Address"}</label>
            <input
              type="email"
              placeholder={p.emailPlaceholder || "email@example.com"}
              style={inputStyle}
              readOnly={isEditing}
            />
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* Attendance */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{ ...fieldLabelStyle, display: "inline-block", marginBottom: "16px" }}
          >
            {p.attendanceLabel || "Will You Be Attending?"}
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {(["accept", "decline"] as const).map((val) => {
              const isActive = attending === val;
              const label =
                val === "accept"
                  ? p.acceptText || "Joyfully Accept"
                  : p.declineText || "Regretfully Decline";
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAttendClick(val)}
                  style={{
                    backgroundColor: isActive ? accentColor : accentTint,
                    color: isActive ? btnText : baseText,
                    border: `1.5px solid ${isActive ? accentColor : accentBorder}`,
                    borderRadius: radius,
                    padding: "14px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    fontFamily: globalStyle.fontFamily,
                    letterSpacing: "0.3px",
                    cursor: isEditing ? "default" : "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {isActive && (
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      {val === "accept" ? "check_circle" : "cancel"}
                    </span>
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* Guest stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <label style={{ ...fieldLabelStyle, marginBottom: 0 }}>
            {p.guestsLabel || "Number of Guests"}
          </label>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => handleGuestStep(-1)}
              disabled={guests <= 1}
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: inputBg,
                border: `1px solid ${borderStrong}`,
                borderRadius: `${radius} 0 0 ${radius}`,
                color: guests <= 1 ? mutedText : baseText,
                fontSize: "18px",
                cursor: guests <= 1 || isEditing ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              −
            </button>
            <div
              style={{
                minWidth: "96px",
                height: "36px",
                backgroundColor: inputBg,
                borderTop: `1px solid ${borderStrong}`,
                borderBottom: `1px solid ${borderStrong}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: globalStyle.fontFamily,
                color: baseText,
                userSelect: "none",
              }}
            >
              {guestLabel}
            </div>
            <button
              type="button"
              onClick={() => handleGuestStep(1)}
              disabled={guests >= maxGuests}
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: inputBg,
                border: `1px solid ${borderStrong}`,
                borderRadius: `0 ${radius} ${radius} 0`,
                color: guests >= maxGuests ? mutedText : baseText,
                fontSize: "18px",
                cursor: guests >= maxGuests || isEditing ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href={isEditing ? undefined : p.submitUrl || "#"}
            onClick={isEditing ? (e) => e.preventDefault() : undefined}
            style={{
              backgroundColor: accentColor,
              color: btnText,
              borderRadius: "999px",
              padding: "15px 48px",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: globalStyle.fontFamily,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
          >
            {p.submitText || "Confirm Attendance"}
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              arrow_forward
            </span>
          </a>
        </div>

      </div>
    </div>
  );
}
