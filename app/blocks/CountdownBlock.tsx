import { useEffect, useMemo, useState } from "react";
import { resolveTextColor } from "~/lib/blockColors";
import type { BlockComponentProps } from "~/types/editor";

interface CountdownBlockProps {
	eventDate?: string;
	eventTime?: string;
	showDays?: boolean;
	showHours?: boolean;
	showMinutes?: boolean;
	showSeconds?: boolean;
}

type CountdownUnitKey = "days" | "hours" | "minutes" | "seconds";

const FALLBACK_DATE = "2024-08-08";
const FALLBACK_TIME = "15:00";
const SCALE_MIN = 25;
const SCALE_MAX = 300;
const SCALE_DEFAULT = 100;

const COUNTDOWN_UNIT_SECONDS: Record<CountdownUnitKey, number> = {
	days: 86_400,
	hours: 3_600,
	minutes: 60,
	seconds: 1,
};

const COUNTDOWN_UNIT_LABELS: Record<CountdownUnitKey, string> = {
	days: "DAYS",
	hours: "HOURS",
	minutes: "MINUTES",
	seconds: "SECONDS",
};

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

function getScalePercent(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return SCALE_DEFAULT;
	return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value)));
}

function getSafeTargetTimestamp(eventDate: unknown, eventTime: unknown): number {
	const parsedDate = parseDateInput(eventDate) ?? parseDateInput(FALLBACK_DATE)!;
	const parsedTime = parseTimeInput(eventTime) ?? parseTimeInput(FALLBACK_TIME)!;
	parsedDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
	return parsedDate.getTime();
}

function resolveToggleValue(value: unknown, fallback: boolean): boolean {
	if (typeof value === "boolean") return value;
	return fallback;
}

function formatUnitValue(unitKey: CountdownUnitKey, value: number): string {
	if (unitKey === "days") return String(value);
	return String(value).padStart(2, "0");
}

function buildCountdownValues(
	totalSeconds: number,
	visibleUnits: CountdownUnitKey[],
): Record<CountdownUnitKey, number> {
	const values: Record<CountdownUnitKey, number> = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	};

	let remainingSeconds = totalSeconds;
	visibleUnits.forEach((unitKey) => {
		const unitSize = COUNTDOWN_UNIT_SECONDS[unitKey];
		const unitValue = Math.floor(remainingSeconds / unitSize);
		values[unitKey] = unitValue;
		remainingSeconds -= unitValue * unitSize;
	});

	return values;
}

export function CountdownBlock({ block, globalStyle }: BlockComponentProps) {
	const props = block.props as CountdownBlockProps;
	const s = block.style;
	const textColor = resolveTextColor(s, globalStyle);
	const flowScalePercent =
		block.style.positionMode === "absolute" ? SCALE_DEFAULT : getScalePercent(s.scale);
	const flowScaleFactor = flowScalePercent / 100;
	const scaleLength = (rawLength: string) =>
		flowScaleFactor === 1 ? rawLength : `calc(${rawLength} * ${flowScaleFactor})`;

	const showDays = resolveToggleValue(props.showDays, true);
	const showHours = resolveToggleValue(props.showHours, true);
	const showMinutes = resolveToggleValue(props.showMinutes, true);
	const showSeconds = resolveToggleValue(props.showSeconds, false);

	const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

	useEffect(() => {
		const timer = window.setInterval(() => {
			setNowTimestamp(Date.now());
		}, 1000);

		return () => {
			window.clearInterval(timer);
		};
	}, []);

	const targetTimestamp = useMemo(
		() => getSafeTargetTimestamp(props.eventDate, props.eventTime),
		[props.eventDate, props.eventTime],
	);

	const visibleUnits = useMemo(() => {
		const units: CountdownUnitKey[] = [];
		if (showDays) units.push("days");
		if (showHours) units.push("hours");
		if (showMinutes) units.push("minutes");
		if (showSeconds) units.push("seconds");
		return units;
	}, [showDays, showHours, showMinutes, showSeconds]);

	const totalSecondsRemaining = Math.max(0, Math.floor((targetTimestamp - nowTimestamp) / 1000));
	const countdownValues = buildCountdownValues(totalSecondsRemaining, visibleUnits);

	if (visibleUnits.length === 0) {
		return (
			<div
				className="mx-auto w-full px-2 text-center sm:px-4"
				style={{
					fontFamily: s.fontFamily || globalStyle.fontFamily,
					color: textColor,
					opacity: (s.opacity ?? 100) / 100,
					marginTop: s.marginTop ?? 0,
					marginBottom: s.marginBottom ?? 0,
				}}>
				<p
					className="font-medium uppercase tracking-[0.14em]"
					style={{ fontSize: scaleLength("clamp(0.7rem, 1.6vw, 1rem)") }}>
					Enable at least one time unit
				</p>
			</div>
		);
	}

	return (
		<div
			className="mx-auto w-full px-2 sm:px-4"
			style={{
				fontFamily: s.fontFamily || globalStyle.fontFamily,
				color: textColor,
				opacity: (s.opacity ?? 100) / 100,
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
			}}>
			<div
				className="flex flex-wrap items-end justify-center"
				style={{ gap: scaleLength("clamp(0.85rem, 3.2vw, 3.8rem)") }}>
				{visibleUnits.map((unitKey) => (
					<div
						key={unitKey}
						className="flex min-w-[4.25rem] flex-col items-center text-center"
						style={{
							rowGap: scaleLength("clamp(0.25rem, 0.7vw, 0.5rem)"),
						}}>
						<p
							className="font-semibold leading-none tracking-[0.02em] tabular-nums"
							style={{ fontSize: scaleLength("clamp(2rem, 10vw, 6rem)") }}>
							{formatUnitValue(unitKey, countdownValues[unitKey])}
						</p>
						<p
							className="font-medium leading-none tracking-[0.24em]"
							style={{ fontSize: scaleLength("clamp(0.62rem, 1.5vw, 0.95rem)") }}>
							{COUNTDOWN_UNIT_LABELS[unitKey]}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
