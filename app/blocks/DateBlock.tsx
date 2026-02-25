import { resolveTextColor } from "~/lib/blockColors";
import { hexToRgba } from "~/lib/colorSystem";
import type { BlockComponentProps } from "~/types/editor";

interface DateBlockProps {
	eventDate?: string;
	eventTime?: string;
}

const FALLBACK_DATE = "2024-08-08";
const FALLBACK_TIME = "15:00";
const WIDTH_MIN = 320;
const WIDTH_MAX = 1600;
const WIDTH_DEFAULT = 920;
const SECTION_GAP_MIN = 0;
const SECTION_GAP_MAX = 160;
const SECTION_GAP_DEFAULT = 24;
const SCALE_MIN = 25;
const SCALE_MAX = 300;
const SCALE_DEFAULT = 100;

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long" });

function parseDateInput(value: unknown): Date | null {
	if (typeof value !== "string") return null;

	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return null;
	}

	const parsedDate = new Date(year, month - 1, day);
	if (
		parsedDate.getFullYear() !== year ||
		parsedDate.getMonth() !== month - 1 ||
		parsedDate.getDate() !== day
	) {
		return null;
	}

	return parsedDate;
}

function parseTimeInput(value: unknown): { hours: number; minutes: number } | null {
	if (typeof value !== "string") return null;

	const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
	if (!match) return null;

	const hours = Number(match[1]);
	const minutes = Number(match[2]);

	if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

	return { hours, minutes };
}

function formatTimeLabel(hours24: number, minutes: number): string {
	const suffix = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 || 12;
	return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getScalePercent(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return SCALE_DEFAULT;
	return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value)));
}

function getBlockWidthPx(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return WIDTH_DEFAULT;
	return Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, Math.round(value)));
}

function getSectionGapPx(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return SECTION_GAP_DEFAULT;
	return Math.min(SECTION_GAP_MAX, Math.max(SECTION_GAP_MIN, Math.round(value)));
}

export function DateBlock({ block, globalStyle }: BlockComponentProps) {
	const { eventDate, eventTime } = block.props as DateBlockProps;
	const s = block.style;
	const textColor = resolveTextColor(s, globalStyle);
	const blockWidthPx = getBlockWidthPx(s.widthPx);
	const sectionGapPx = getSectionGapPx(s.dateSectionGap);
	const flowScalePercent =
		block.style.positionMode === "absolute" ? SCALE_DEFAULT : getScalePercent(s.scale);
	const flowScaleFactor = flowScalePercent / 100;
	const scaleLength = (rawLength: string) =>
		flowScaleFactor === 1 ? rawLength : `calc(${rawLength} * ${flowScaleFactor})`;
	const scalePx = (value: number) => `${Math.round(value * flowScaleFactor * 10) / 10}px`;
	const blurTight = Math.max(4, Math.round(14 * flowScaleFactor));
	const blurSoft = Math.max(8, Math.round(30 * flowScaleFactor));
	const haloBlur = Math.max(10, Math.round(36 * flowScaleFactor));
	const cloneOffset = Math.max(1, Math.round(3 * flowScaleFactor));
	const dayHaloGradient = `radial-gradient(circle at 50% 50%, ${hexToRgba(
		textColor,
		globalStyle.themeMode === "dark" ? 0.6 : 0.42,
	)} 0%, ${hexToRgba(
		textColor,
		globalStyle.themeMode === "dark" ? 0.28 : 0.16,
	)} 56%, ${hexToRgba(textColor, 0)} 100%)`;

	const dateValue = parseDateInput(eventDate) ?? parseDateInput(FALLBACK_DATE)!;
	const timeValue = parseTimeInput(eventTime) ?? parseTimeInput(FALLBACK_TIME)!;

	const weekdayLabel = WEEKDAY_FORMATTER.format(dateValue).toUpperCase();
	const monthLabel = MONTH_FORMATTER.format(dateValue).toUpperCase();
	const dayLabel = String(dateValue.getDate()).padStart(2, "0");
	const yearLabel = String(dateValue.getFullYear());
	const timeLabel = formatTimeLabel(timeValue.hours, timeValue.minutes);

	return (
		<div
			className="mx-auto w-full px-2 sm:px-4"
			style={{
				fontFamily: s.fontFamily || globalStyle.fontFamily,
				color: textColor,
				opacity: (s.opacity ?? 100) / 100,
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
				maxWidth: `${blockWidthPx}px`,
			}}>
			<div
				className="flex flex-col items-center"
				style={{ gap: scalePx(sectionGapPx) }}>
				<p
					className="text-center font-semibold leading-none tracking-[0.22em]"
					style={{ fontSize: scaleLength("clamp(1.35rem, 4.6vw, 4.2rem)") }}>
					{weekdayLabel}
				</p>

				<div
					className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center"
					style={{ gap: scaleLength("clamp(0.75rem, 1.8vw, 1.5rem)") }}>
					<div
						className="flex flex-col"
						style={{ gap: scaleLength("clamp(0.5rem, 1vw, 0.75rem)") }}>
						<div
							className="h-px w-full"
							style={{ backgroundColor: textColor, opacity: 0.45 }}
						/>
						<p
							className="text-center font-medium leading-none tracking-[0.18em]"
							style={{ fontSize: scaleLength("clamp(1rem, 3vw, 3.2rem)") }}>
							{monthLabel}
						</p>
						<div
							className="h-px w-full"
							style={{ backgroundColor: textColor, opacity: 0.45 }}
						/>
					</div>

					<p className="relative text-center font-semibold leading-none tracking-[0.05em] tabular-nums">
						<span
							aria-hidden
							className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
							style={{
								width: scaleLength("clamp(6rem, 20vw, 14rem)"),
								height: scaleLength("clamp(3.8rem, 11vw, 8.2rem)"),
								background: dayHaloGradient,
								filter: `blur(${haloBlur}px)`,
								transform: "translate(-50%, -46%)",
							}}
						/>
						<span
							aria-hidden
							className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
							style={{
								fontSize: scaleLength("clamp(4rem, 15vw, 11rem)"),
								color: textColor,
								opacity: globalStyle.themeMode === "dark" ? 0.78 : 0.62,
								filter: `blur(${blurSoft}px)`,
								transform: `translateY(${cloneOffset}px) scale(1.07)`,
							}}>
							{dayLabel}
						</span>
						<span
							aria-hidden
							className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
							style={{
								fontSize: scaleLength("clamp(4rem, 15vw, 11rem)"),
								color: textColor,
								opacity: globalStyle.themeMode === "dark" ? 0.48 : 0.36,
								filter: `blur(${blurTight}px)`,
								transform: `translateY(${Math.max(1, cloneOffset - 1)}px) scale(1.03)`,
							}}>
							{dayLabel}
						</span>
						<span
							className="relative"
							style={{
								fontSize: scaleLength("clamp(4rem, 15vw, 11rem)"),
								color: textColor,
							}}>
							{dayLabel}
						</span>
					</p>

					<div
						className="flex flex-col"
						style={{ gap: scaleLength("clamp(0.5rem, 1vw, 0.75rem)") }}>
						<div
							className="h-px w-full"
							style={{ backgroundColor: textColor, opacity: 0.45 }}
						/>
						<p
							className="text-center font-medium leading-none tracking-[0.14em] tabular-nums"
							style={{ fontSize: scaleLength("clamp(1rem, 3vw, 3.2rem)") }}>
							{timeLabel}
						</p>
						<div
							className="h-px w-full"
							style={{ backgroundColor: textColor, opacity: 0.45 }}
						/>
					</div>
				</div>

				<p
					className="text-center font-semibold leading-none tracking-[0.2em] tabular-nums"
					style={{ fontSize: scaleLength("clamp(1.6rem, 5vw, 5rem)") }}>
					{yearLabel}
				</p>
			</div>
		</div>
	);
}
