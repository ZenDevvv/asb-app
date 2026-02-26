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
	const lineColor = hexToRgba(titleColor, isDarkTheme ? 0.18 : 0.22);
	const iconBorderColor = hexToRgba(subtitleColor, isDarkTheme ? 0.85 : 0.72);
	const iconBackground = hexToRgba(subtitleColor, isDarkTheme ? 0.14 : 0.1);

	const timelineItems = getTimelineItems(props.timeline);

	if (timelineItems.length === 0) {
		return (
			<div
				className="mx-auto w-full px-2 text-center sm:px-4"
				style={{
					fontFamily: s.fontFamily || globalStyle.fontFamily,
					color: descriptionColor,
					opacity: (s.opacity ?? 100) / 100,
					marginTop: s.marginTop ?? 0,
					marginBottom: s.marginBottom ?? 0,
				}}>
				<p style={{ fontSize: scaleLength("clamp(0.85rem, 1.8vw, 1rem)") }}>
					Add timeline items to start building this section.
				</p>
			</div>
		);
	}

	return (
		<div
			className="mx-auto w-full px-2 sm:px-4"
			style={{
				fontFamily: s.fontFamily || globalStyle.fontFamily,
				opacity: (s.opacity ?? 100) / 100,
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
			}}>
			<div className="relative mx-auto max-w-5xl">
				<div
					aria-hidden
					className="absolute bottom-0 top-0 left-5 w-px md:left-1/2 md:-translate-x-1/2"
					style={{ backgroundColor: lineColor }}
				/>

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
										fontSize: scaleLength("clamp(1.3rem, 3vw, 2.2rem)"),
									}}>
									{title}
								</p>
								{subtitle && (
									<p
										className="font-medium leading-tight tracking-[0.05em]"
										style={{
											color: subtitleColor,
											fontSize: scaleLength("clamp(0.85rem, 1.5vw, 1.2rem)"),
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
									fontSize: scaleLength("clamp(0.86rem, 1.35vw, 1.07rem)"),
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
								<div className="hidden md:block" style={{ textAlign: "right" }}>
									{isTitleOnLeft ? titleSubtitleContent : descriptionContent}
								</div>

								<div className="relative z-10 flex items-center justify-center md:justify-center">
									<span
										className="inline-flex items-center justify-center rounded-full border"
										style={{
											width: scaleLength("clamp(2.35rem, 3.4vw, 2.9rem)"),
											height: scaleLength("clamp(2.35rem, 3.4vw, 2.9rem)"),
											backgroundColor: iconBackground,
											borderColor: iconBorderColor,
											color: subtitleColor,
										}}>
										<span
											className="material-symbols-outlined"
											style={{
												fontSize: scaleLength(
													"clamp(1rem, 1.55vw, 1.26rem)",
												),
											}}>
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
