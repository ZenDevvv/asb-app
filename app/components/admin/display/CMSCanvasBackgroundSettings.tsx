import { Image as ImageIcon, PaintBucket, Video } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { type CMSCanvasBackgroundType, useDisplayStore } from "~/stores/displayStore";

const BACKGROUND_TYPE_OPTIONS: Array<{
	value: CMSCanvasBackgroundType;
	label: string;
	icon: typeof PaintBucket;
}> = [
	{ value: "color", label: "Color", icon: PaintBucket },
	{ value: "image", label: "Image", icon: ImageIcon },
	{ value: "video", label: "Video", icon: Video },
];

export function CMSCanvasBackgroundSettings() {
	const canvasBackground = useDisplayStore((state) => state.canvasBackground);
	const setCanvasBackground = useDisplayStore((state) => state.setCanvasBackground);

	const selectedTypeOption =
		BACKGROUND_TYPE_OPTIONS.find((option) => option.value === canvasBackground.type) ??
		BACKGROUND_TYPE_OPTIONS[0];

	return (
		<div className="space-y-3 rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
					Canvas Background
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Choose a background style for the whole canvas.
				</p>
			</div>

			<Select
				value={canvasBackground.type}
				onValueChange={(value) =>
					setCanvasBackground({ type: value as CMSCanvasBackgroundType })
				}>
				<SelectTrigger
					size="sm"
					className="h-8 w-full rounded-lg border-sidebar-border bg-background text-xs text-sidebar-foreground">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="border-sidebar-border bg-sidebar text-sidebar-foreground">
					{BACKGROUND_TYPE_OPTIONS.map((option) => {
						const OptionIcon = option.icon;
						return (
							<SelectItem key={option.value} value={option.value}>
								<span className="inline-flex items-center gap-2">
									<OptionIcon className="h-3.5 w-3.5" />
									{option.label}
								</span>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>

			{canvasBackground.type === "color" ? (
				<label className="space-y-1.5">
					<span className="text-xs text-muted-foreground">Canvas Color</span>
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={canvasBackground.color}
							onChange={(event) => setCanvasBackground({ color: event.target.value })}
							className="h-9 w-11 cursor-pointer rounded-md border border-sidebar-border bg-background p-1"
						/>
						<span className="text-xs text-muted-foreground">
							{canvasBackground.color}
						</span>
					</div>
				</label>
			) : null}

			{canvasBackground.type === "image" ? (
				<label className="space-y-1.5">
					<span className="text-xs text-muted-foreground">Image URL</span>
					<Input
						value={canvasBackground.imageUrl}
						onChange={(event) => setCanvasBackground({ imageUrl: event.target.value })}
						placeholder="https://example.com/background.jpg"
						className="h-9 bg-background text-xs"
					/>
				</label>
			) : null}

			{canvasBackground.type === "video" ? (
				<label className="space-y-1.5">
					<span className="text-xs text-muted-foreground">Video URL</span>
					<Input
						value={canvasBackground.videoUrl}
						onChange={(event) => setCanvasBackground({ videoUrl: event.target.value })}
						placeholder="https://example.com/background.mp4"
						className="h-9 bg-background text-xs"
					/>
				</label>
			) : null}

			<div className="relative h-20 overflow-hidden rounded-lg border border-sidebar-border bg-background">
				{canvasBackground.type === "color" ? (
					<div
						className="absolute inset-0"
						style={{ backgroundColor: canvasBackground.color }}
					/>
				) : null}
				{canvasBackground.type === "image" && canvasBackground.imageUrl ? (
					<img
						src={canvasBackground.imageUrl}
						alt="Canvas background preview"
						className="absolute inset-0 h-full w-full object-cover"
						loading="lazy"
					/>
				) : null}
				{canvasBackground.type === "video" && canvasBackground.videoUrl ? (
					<video
						src={canvasBackground.videoUrl}
						autoPlay
						muted
						loop
						playsInline
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : null}
				<div className="absolute inset-0 bg-black/15" />
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white">
						{selectedTypeOption.label} Preview
					</span>
				</div>
			</div>
		</div>
	);
}
