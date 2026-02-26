import { hexToRgba } from "~/lib/colorSystem";
import type { BlockComponentProps } from "~/types/editor";

interface TimelineItem {
	title?: string;
	subtitle?: string;
	icon?: string;
	description?: string;
}

interface TimelineBlockProps {
	timeline?: TimelineItem[];
	titleColor?: string;
	subtitleColor?: string;
	descriptionColor?: string;
}

const SCALE_MIN = 25;
const SCALE_MAX = 300;
const SCALE_DEFAULT = 100;
const DEFAULT_TITLE_DARK = "#ffffff";
const DEFAULT_TITLE_LIGHT = "#111111";
const DEFAULT_DESCRIPTION_DARK = "#a1a1aa";
const DEFAULT_DESCRIPTION_LIGHT = "#6b7280";
const DEFAULT_ACCENT = "#00e5a0";

function getScalePercent(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return SCALE_DEFAULT;
	return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value)));
}

function getStringOrFallback(value: unknown, fallback: string): string {
	if (typeof value !== "string") return fallback;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : fallback;
}

function getTimelineItems(value: unknown): TimelineItem[] {
	if (!Array.isArray(value)) return [];

	return value.filter((item) => typeof item === "object" && item !== null) as TimelineItem[];
}

export function TimelineBlock({ block, globalStyle }: BlockComponentProps) {
	const props = block.props as TimelineBlockProps;
	const s = block.style;
	const isDarkTheme = globalStyle.themeMode === "dark";
	const flowScalePercent =
		block.style.positionMode === "absolute" ? SCALE_DEFAULT : getScalePercent(s.scale);
	const flowScaleFactor = flowScalePercent / 100;
	const scaleLength = (rawLength: string) =>
		flowScaleFactor === 1 ? rawLength : `calc(${rawLength} * ${flowScaleFactor})`;
	const scalePx = (value: number) => `${Math.round(value * flowScaleFactor * 10) / 10}px`;

	const titleColor = getStringOrFallback(
		props.titleColor,
		isDarkTheme ? DEFAULT_TITLE_DARK : DEFAULT_TITLE_LIGHT,
	);
	const subtitleColor = getStringOrFallback(
		props.subtitleColor,
		globalStyle.primaryColor || DEFAULT_ACCENT,
	);
	const descriptionColor = getStringOrFallback(
		props.descriptionColor,
		isDarkTheme ? DEFAULT_DESCRIPTION_DARK : DEFAULT_DESCRIPTION_LIGHT,
	);
	const titleFontFamily = s.fontFamily || globalStyle.fontFamily;
	const detailFontFamily = s.secondaryFontFamily || globalStyle.fontFamily;
	const lineColor = hexToRgba(titleColor, isDarkTheme ? 0.34 : 0.32);
	const iconBorderColor = hexToRgba(subtitleColor, isDarkTheme ? 0.85 : 0.72);
	const iconBackground = hexToRgba(subtitleColor, isDarkTheme ? 0.14 : 0.1);
	const iconDiameter = scaleLength("clamp(2.35rem, 3.4vw, 2.9rem)");
	const iconGlyphSize = scaleLength("clamp(1rem, 1.55vw, 1.26rem)");
	const iconHalf = scaleLength("clamp(1.175rem, 1.7vw, 1.45rem)");

	const timelineItems = getTimelineItems(props.timeline);

	if (timelineItems.length === 0) {
		return (
			<div
				className="mx-auto w-full px-2 text-center sm:px-4"
				style={{
					fontFamily: detailFontFamily,
					color: descriptionColor,
					opacity: (s.opacity ?? 100) / 100,
					marginTop: s.marginTop ?? 0,
					marginBottom: s.marginBottom ?? 0,
				}}>
				<p style={{ fontSize: scaleLength("clamp(0.78rem, 1.4vw, 0.9rem)") }}>
					Add timeline items to start building this section.
				</p>
			</div>
		);
	}

	return (
		<div
			className="mx-auto w-full px-2 sm:px-4"
			style={{
				opacity: (s.opacity ?? 100) / 100,
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
			}}>
			<div className="relative mx-auto max-w-5xl">
				<div>
					{timelineItems.map((item, index) => {
						const isTitleOnLeft = index % 2 === 0;
						const title = getStringOrFallback(item.title, "Timeline Event");
						const subtitle = getStringOrFallback(item.subtitle, "");
						const icon = getStringOrFallback(item.icon, "schedule");
						const description = getStringOrFallback(
							item.description,
							"Add a short description for this timeline entry.",
						);

						const titleSubtitleContent = (
							<div className="space-y-1">
								<p
									className="font-semibold leading-tight"
									style={{
										color: titleColor,
										fontFamily: titleFontFamily,
										fontSize: scaleLength("clamp(1.02rem, 2vw, 1.5rem)"),
									}}>
									{title}
								</p>
								{subtitle && (
									<p
										className="font-medium leading-tight tracking-[0.05em]"
										style={{
											color: subtitleColor,
											fontFamily: detailFontFamily,
											fontSize: scaleLength("clamp(0.72rem, 0.95vw, 0.9rem)"),
										}}>
										{subtitle}
									</p>
								)}
							</div>
						);

						const descriptionContent = (
							<p
								className="leading-relaxed"
								style={{
									color: descriptionColor,
									fontFamily: detailFontFamily,
									fontSize: scaleLength("clamp(0.74rem, 0.92vw, 0.88rem)"),
								}}>
								{description}
							</p>
						);

						return (
							<div
								key={`${index}-${title}-${subtitle}`}
								className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-center md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
								style={{
									columnGap: scalePx(24),
									paddingTop: scalePx(18),
									paddingBottom: scalePx(18),
								}}>
								{index > 0 && (
									<span
										aria-hidden
										className="absolute left-5 top-0 z-0 w-px md:left-1/2 md:-translate-x-1/2"
										style={{
											height: `calc(50% - ${iconHalf})`,
											backgroundColor: lineColor,
										}}
									/>
								)}
								{index < timelineItems.length - 1 && (
									<span
										aria-hidden
										className="absolute bottom-0 left-5 z-0 w-px md:left-1/2 md:-translate-x-1/2"
										style={{
											height: `calc(50% - ${iconHalf})`,
											backgroundColor: lineColor,
										}}
									/>
								)}

								<div className="hidden md:block" style={{ textAlign: "right" }}>
									{isTitleOnLeft ? titleSubtitleContent : descriptionContent}
								</div>

								<div className="relative z-10 flex items-center justify-center md:justify-center">
									<span
										className="relative z-10 inline-flex items-center justify-center rounded-full border"
										style={{
											width: iconDiameter,
											height: iconDiameter,
											backgroundColor: iconBackground,
											borderColor: iconBorderColor,
											color: subtitleColor,
										}}>
										<span
											className="material-symbols-outlined"
											style={{ fontSize: iconGlyphSize }}>
											{icon}
										</span>
									</span>
								</div>

								<div className="hidden md:block" style={{ textAlign: "left" }}>
									{isTitleOnLeft ? descriptionContent : titleSubtitleContent}
								</div>

								<div className="space-y-1.5 pb-0.5 pr-1 md:hidden">
									{titleSubtitleContent}
									{descriptionContent}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
