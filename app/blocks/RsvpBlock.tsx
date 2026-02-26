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

const RSVP_VARIANTS = ["default", "postcard"] as const;
type RsvpVariant = (typeof RSVP_VARIANTS)[number];

const RSVP_APPEARANCES_BY_VARIANT: Record<RsvpVariant, readonly string[]> = {
	default: ["classic"],
	postcard: ["postal-card"],
};

interface RsvpProps {
	variant?: RsvpVariant;
	appearance?: string;
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
	postcardTitle?: string;
	postcardQuote?: string;
	postcardQuoteAuthor?: string;
	returnToLabel?: string;
	returnToName?: string;
	returnToAddressLine1?: string;
	returnToAddressLine2?: string;
	bgColor?: string;
	fgColor?: string;
}

function hexToRgb(hex: string): [number, number, number] | null {
	const clean = hex.replace("#", "");
	if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
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
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isDark(hex: string): boolean {
	return luminance(hex) < 128;
}

function shiftHex(hex: string, amount: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	const [r, g, b] = rgb.map((channel) => Math.max(0, Math.min(255, channel + amount)));
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function mixHex(hex: string, toward: "white" | "black", strength: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	const target = toward === "white" ? 255 : 0;
	const [r, g, b] = rgb.map((channel) => Math.round(channel + (target - channel) * strength));
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function resolveRsvpVariant(props: Record<string, unknown>): RsvpVariant {
	const rawVariant = props.variant;
	if (typeof rawVariant === "string" && RSVP_VARIANTS.includes(rawVariant as RsvpVariant)) {
		return rawVariant as RsvpVariant;
	}

	const rawAppearance = props.appearance;
	if (
		typeof rawAppearance === "string" &&
		RSVP_APPEARANCES_BY_VARIANT.postcard.includes(rawAppearance)
	) {
		return "postcard";
	}

	return "default";
}

function resolveRsvpAppearance(props: Record<string, unknown>, variant: RsvpVariant): string {
	const allowedAppearances = RSVP_APPEARANCES_BY_VARIANT[variant];
	const rawAppearance = props.appearance;
	if (typeof rawAppearance === "string" && allowedAppearances.includes(rawAppearance)) {
		return rawAppearance;
	}

	// Backward compatibility: historical payloads could store style value in `variant`.
	const rawLegacyVariant = props.variant;
	if (typeof rawLegacyVariant === "string" && allowedAppearances.includes(rawLegacyVariant)) {
		return rawLegacyVariant;
	}

	return allowedAppearances[0];
}

function getTilt(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return 0;
	return Math.max(-180, Math.min(180, value));
}

export function RsvpBlock({ block, globalStyle, isEditing }: BlockComponentProps) {
	const [attending, setAttending] = useState<"accept" | "decline" | null>(null);
	const [guests, setGuests] = useState(1);

	const p = block.props as RsvpProps;
	const s = block.style;

	const variant = resolveRsvpVariant(block.props);
	const appearance = resolveRsvpAppearance(block.props, variant);
	const isPostcard = variant === "postcard" && appearance === "postal-card";

	const themeIsDark = globalStyle.themeMode === "dark";
	const accentColor = resolveAccentColor(s, globalStyle);
	const radius = RADIUS_MAP[globalStyle.borderRadius || "md"] ?? "10px";
	const maxGuests = Math.max(1, Math.min(20, Number(p.maxGuests) || 10));
	const tilt = getTilt(s.tilt);
	const tiltStyle: React.CSSProperties =
		tilt === 0 ? {} : { transform: `rotate(${tilt}deg)`, transformOrigin: "center" };

	const handleAttendClick = (value: "accept" | "decline") => {
		if (!isEditing) setAttending(value);
	};

	const handleGuestStep = (delta: number) => {
		if (isEditing) return;
		setGuests((prev) => Math.max(1, Math.min(maxGuests, prev + delta)));
	};

	const handleSubmitClick = isEditing
		? (event: React.MouseEvent) => event.preventDefault()
		: undefined;

	if (!isPostcard) {
		const baseBg = p.bgColor || (themeIsDark ? "#0d1526" : "#f4f5f7");
		const bgIsDark = isDark(baseBg);
		const inputBg = bgIsDark ? mixHex(baseBg, "black", 0.25) : mixHex(baseBg, "white", 0.6);
		const borderStrong = bgIsDark
			? mixHex(baseBg, "white", 0.18)
			: mixHex(baseBg, "black", 0.18);
		const borderSubtle = bgIsDark ? mixHex(baseBg, "white", 0.1) : mixHex(baseBg, "black", 0.1);
		const baseText = p.fgColor || (bgIsDark ? "#ffffff" : "#111111");
		const labelText = shiftHex(baseText, isDark(baseText) ? -20 : 20);
		const mutedText = `${baseText}66`;
		const accentTint = `${accentColor}1a`;
		const accentBorder = `${accentColor}45`;
		const buttonText = isDark(accentColor) ? "#ffffff" : "#000000";
		const guestLabel = guests === 1 ? "1 Guest" : `${guests} Guests`;

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
					...tiltStyle,
				}}>
				<div style={{ padding: "32px 36px 36px" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
							gap: "20px",
						}}>
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

					<div style={{ textAlign: "center" }}>
						<span
							style={{
								...fieldLabelStyle,
								display: "inline-block",
								marginBottom: "16px",
							}}>
							{p.attendanceLabel || "Will You Be Attending?"}
						</span>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
								gap: "12px",
							}}>
							{(["accept", "decline"] as const).map((value) => {
								const isActive = attending === value;
								const label =
									value === "accept"
										? p.acceptText || "Joyfully Accept"
										: p.declineText || "Regretfully Decline";

								return (
									<button
										key={value}
										type="button"
										onClick={() => handleAttendClick(value)}
										style={{
											backgroundColor: isActive ? accentColor : accentTint,
											color: isActive ? buttonText : baseText,
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
										}}>
										{isActive && (
											<span
												className="material-symbols-outlined"
												style={{ fontSize: "16px" }}>
												{value === "accept" ? "check_circle" : "cancel"}
											</span>
										)}
										{label}
									</button>
								);
							})}
						</div>
					</div>

					<hr style={dividerStyle} />

					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "28px",
							gap: "16px",
							flexWrap: "wrap",
						}}>
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
								}}>
								-
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
								}}>
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
									cursor:
										guests >= maxGuests || isEditing ? "default" : "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}>
								+
							</button>
						</div>
					</div>

					<div style={{ display: "flex", justifyContent: "center" }}>
						<a
							href={isEditing ? undefined : p.submitUrl || "#"}
							onClick={handleSubmitClick}
							style={{
								backgroundColor: accentColor,
								color: buttonText,
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
							}}>
							{p.submitText || "Confirm Attendance"}
							<span
								className="material-symbols-outlined"
								style={{ fontSize: "18px" }}>
								arrow_forward
							</span>
						</a>
					</div>
				</div>
			</div>
		);
	}

	const postcardBg = p.bgColor || (themeIsDark ? "#1f2532" : "#f7f3ed");
	const postcardText = p.fgColor || (themeIsDark ? "#d7e0ee" : "#55637d");
	const postcardHeading = themeIsDark ? "#f3f5fa" : "#1a223a";
	const postcardLine = themeIsDark ? "rgba(215,224,238,0.35)" : "#d4dce8";
	const postcardDivider = themeIsDark ? "rgba(215,224,238,0.22)" : "#dfe5ed";
	const postcardLabel = themeIsDark ? "#aebbd0" : "#8ea2bc";
	const postcardSubmitText = isDark(accentColor) ? "#ffffff" : "#2b1b10";
	const quoteText = p.postcardQuote || '"Love is the flower you\'ve got to let grow."';

	const postcardInputStyle: React.CSSProperties = {
		width: "100%",
		border: "none",
		borderBottom: `2px solid ${postcardLine}`,
		backgroundColor: "transparent",
		color: postcardText,
		padding: "8px 2px 10px",
		fontSize: "28px",
		fontFamily: globalStyle.fontFamily,
		outline: "none",
		boxSizing: "border-box",
	};

	const postcardFieldLabelStyle: React.CSSProperties = {
		display: "block",
		color: postcardLabel,
		fontSize: "14px",
		fontFamily: globalStyle.fontFamily,
		marginBottom: "2px",
	};

	const postcardChoiceButtonStyle = (active: boolean): React.CSSProperties => ({
		border: "none",
		backgroundColor: "transparent",
		color: postcardText,
		cursor: isEditing ? "default" : "pointer",
		display: "flex",
		alignItems: "center",
		gap: "10px",
		padding: "4px 0",
		fontSize: "15px",
		fontWeight: active ? "600" : "500",
		fontFamily: globalStyle.fontFamily,
	});

	return (
		<div
			style={{
				backgroundColor: postcardBg,
				border: `1px solid ${postcardDivider}`,
				borderRadius: "2px",
				overflow: "hidden",
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
				width: "100%",
				boxSizing: "border-box",
				...tiltStyle,
			}}>
			<div className="grid grid-cols-1 md:grid-cols-2">
				<div
					className="border-b md:border-b-0 md:border-r"
					style={{
						borderColor: postcardDivider,
						padding: "34px 42px 32px",
						minHeight: "420px",
					}}>
					<div
						style={{
							height: "100%",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							gap: "32px",
						}}>
						<div>
							<h3
								style={{
									margin: 0,
									color: postcardHeading,
									fontFamily: '"Cormorant Garamond", serif',
									fontSize: "56px",
									lineHeight: 1.05,
									fontWeight: 700,
								}}>
								{p.postcardTitle || "Kindly Reply"}
							</h3>
							<p
								style={{
									margin: "18px 0 0",
									color: postcardText,
									fontFamily: '"Cormorant Garamond", serif',
									fontSize: "32px",
									lineHeight: 1.3,
									fontStyle: "italic",
								}}>
								{quoteText}
								<br />- {p.postcardQuoteAuthor || "John Lennon"}
							</p>
						</div>

						<div>
							<p
								style={{
									margin: 0,
									color: postcardLabel,
									fontSize: "13px",
									letterSpacing: "2px",
									textTransform: "uppercase",
									fontWeight: 700,
									fontFamily: globalStyle.fontFamily,
								}}>
								{p.returnToLabel || "Return To:"}
							</p>
							<p
								style={{
									margin: "8px 0 0",
									color: postcardText,
									fontFamily: '"Cormorant Garamond", serif',
									fontSize: "36px",
									lineHeight: 1.2,
									fontWeight: 500,
								}}>
								{p.returnToName || "Jane & John"}
							</p>
							<p
								style={{
									margin: "8px 0 0",
									color: postcardText,
									fontFamily: '"Cormorant Garamond", serif',
									fontSize: "29px",
									lineHeight: 1.35,
								}}>
								{p.returnToAddressLine1 || "123 Bohemian Way"}
								<br />
								{p.returnToAddressLine2 || "Tulum, Mexico 77760"}
							</p>
						</div>
					</div>
				</div>

				<div
					style={{ position: "relative", padding: "34px 42px 34px", minHeight: "420px" }}>
					<div
						style={{
							position: "absolute",
							top: "18px",
							right: "22px",
							display: "flex",
							alignItems: "flex-start",
							gap: "12px",
							pointerEvents: "none",
						}}>
						<div
							style={{
								width: "92px",
								height: "92px",
								borderRadius: "999px",
								border: `2px solid ${postcardDivider}`,
								color: postcardLabel,
								fontSize: "11px",
								fontWeight: 700,
								letterSpacing: "1px",
								textTransform: "uppercase",
								lineHeight: 1.1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
								transform: "rotate(-14deg)",
								fontFamily: globalStyle.fontFamily,
							}}>
							Postage
							<br />
							Paid
							<br />
							Love Air
						</div>
						<div
							style={{
								width: "74px",
								height: "74px",
								border: `2px dashed ${mixHex(accentColor, "white", 0.45)}`,
								color: mixHex(accentColor, "white", 0.3),
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "30px",
								transform: "rotate(4deg)",
							}}>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: "34px" }}>
								favorite
							</span>
						</div>
					</div>

					<div style={{ marginTop: "60px", display: "grid", gap: "20px" }}>
						<div>
							<label style={postcardFieldLabelStyle}>
								{p.nameLabel || "Full Name"}
							</label>
							<input
								type="text"
								placeholder={p.namePlaceholder || "Guest Name"}
								readOnly={isEditing}
								style={postcardInputStyle}
							/>
						</div>

						<div>
							<label style={postcardFieldLabelStyle}>
								{p.emailLabel || "Email Address"}
							</label>
							<input
								type="email"
								placeholder={p.emailPlaceholder || "email@example.com"}
								readOnly={isEditing}
								style={postcardInputStyle}
							/>
						</div>

						<div style={{ marginTop: "4px" }}>
							<p
								style={{
									margin: "0 0 8px",
									color: postcardLabel,
									fontSize: "13px",
									letterSpacing: "1.2px",
									textTransform: "uppercase",
									fontFamily: globalStyle.fontFamily,
									fontWeight: 700,
								}}>
								{p.attendanceLabel || "Will You Be Attending?"}
							</p>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
									gap: "8px 16px",
								}}>
								{(["accept", "decline"] as const).map((value) => {
									const active = attending === value;
									const label =
										value === "accept"
											? p.acceptText || "Joyfully Accepts"
											: p.declineText || "Regretfully Declines";

									return (
										<button
											key={value}
											type="button"
											onClick={() => handleAttendClick(value)}
											style={postcardChoiceButtonStyle(active)}>
											<span
												style={{
													width: "18px",
													height: "18px",
													borderRadius: "999px",
													border: `2px solid ${postcardLine}`,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexShrink: 0,
												}}>
												{active && (
													<span
														style={{
															width: "8px",
															height: "8px",
															borderRadius: "999px",
															backgroundColor: accentColor,
														}}
													/>
												)}
											</span>
											{label}
										</button>
									);
								})}
							</div>
						</div>

						<div style={{ marginTop: "10px" }}>
							<a
								href={isEditing ? undefined : p.submitUrl || "#"}
								onClick={handleSubmitClick}
								style={{
									width: "100%",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "12px",
									textDecoration: "none",
									borderRadius: "6px",
									backgroundColor: accentColor,
									boxShadow: themeIsDark
										? "0 8px 16px rgba(0,0,0,0.35)"
										: "0 8px 16px rgba(143,102,75,0.22)",
									color: postcardSubmitText,
									padding: "14px 20px",
									fontSize: "16px",
									fontWeight: 700,
									fontFamily: globalStyle.fontFamily,
								}}>
								{p.submitText || "Send Response"}
								<span
									className="material-symbols-outlined"
									style={{ fontSize: "20px" }}>
									arrow_forward
								</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
