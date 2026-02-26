import { nanoid } from "nanoid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import type { BlockStyle, BlockType, GlobalStyle } from "~/types/editor";

export const CMS_DISPLAY_STORAGE_KEY = "asb-cms-display";
const LEGACY_DISPLAY_STORAGE_KEY = "asb-tv-display";

export type CMSBlockType = Exclude<BlockType, "button" | "rsvp">;

export interface CMSBlock {
	id: string;
	type: CMSBlockType;
	props: Record<string, unknown>;
	style: Partial<BlockStyle>;
	x: number;
	y: number;
	w: number;
}

export interface CMSResolution {
	label: string;
	width: number;
	height: number;
}

export type CMSCanvasBackgroundType = "color" | "image" | "video";

export interface CMSCanvasBackground {
	type: CMSCanvasBackgroundType;
	color: string;
	imageUrl: string;
	videoUrl: string;
}

export interface CMSDisplaySnapshot {
	resolution: CMSResolution;
	zoom: number;
	blocks: CMSBlock[];
	selectedBlockId: string | null;
	activeTemplateId: string | null;
	canvasBackground: CMSCanvasBackground;
	globalStyle: GlobalStyle;
}

export interface CMSBlockPatch {
	props?: Record<string, unknown>;
	style?: Partial<BlockStyle>;
	x?: number;
	y?: number;
	w?: number;
}

export interface CMSTemplateBlockSeed {
	type: CMSBlockType;
	x: number;
	y: number;
	w?: number;
	props?: Record<string, unknown>;
	style?: Partial<BlockStyle>;
}

export interface CMSTemplate {
	id: string;
	label: string;
	description: string;
	resolution: CMSResolution;
	globalStyle?: Partial<GlobalStyle>;
	blocks: CMSTemplateBlockSeed[];
}

interface CMSDisplayState extends CMSDisplaySnapshot {
	isHydrated: boolean;
}

interface CMSDisplayActions {
	addBlock: (type: CMSBlockType) => void;
	removeBlock: (id: string) => void;
	updateBlock: (id: string, patch: CMSBlockPatch) => void;
	selectBlock: (id: string | null) => void;
	setResolution: (resolution: CMSResolution) => void;
	setZoom: (zoom: number) => void;
	setCanvasBackground: (patch: Partial<CMSCanvasBackground>) => void;
	applyTemplate: (templateId: string) => void;
	resetCanvas: () => void;
	saveToLocalStorage: () => void;
	loadFromLocalStorage: () => void;
}

export const CMS_ALLOWED_BLOCKS: CMSBlockType[] = [
	"heading",
	"text",
	"badge",
	"list",
	"image",
	"video",
	"icon",
	"spacer",
	"divider",
	"card",
	"quote",
	"date",
	"countdown",
	"timeline",
];

export const CMS_PRESETS: CMSResolution[] = [
	{ label: "1080p Landscape", width: 1920, height: 1080 },
	{ label: "4K Landscape", width: 3840, height: 2160 },
	{ label: "720p Landscape", width: 1280, height: 720 },
	{ label: "Portrait HD", width: 1080, height: 1920 },
	{ label: "Custom", width: 1920, height: 1080 },
];

const STOCK_IMAGE_CITY = "https://picsum.photos/id/1033/1920/1080";
const STOCK_IMAGE_LOBBY = "https://picsum.photos/id/1048/1600/900";
const STOCK_IMAGE_MENU = "https://picsum.photos/id/292/1080/1400";
const STOCK_VIDEO_TRAILER = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const STOCK_VIDEO_LOBBY = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const STOCK_VIDEO_MENU = "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

export const CMS_TEMPLATE_LIBRARY: CMSTemplate[] = [
	{
		id: "festival-promo",
		label: "Festival Promo Wall",
		description: "Hero event board with trailer, poster image, and live countdown.",
		resolution: { label: "1080p Landscape", width: 1920, height: 1080 },
		globalStyle: {
			themeMode: "dark",
			primaryColor: "#f59e0b",
			borderRadius: "md",
		},
		blocks: [
			{
				type: "badge",
				x: 5,
				y: 6,
				w: 18,
				props: { text: "LIVE EVENT", variant: "default", appearance: "filled" },
			},
			{
				type: "heading",
				x: 5,
				y: 14,
				w: 52,
				props: { text: "City Nights Film Festival" },
				style: { fontSize: "5xl", fontWeight: "bold" },
			},
			{
				type: "text",
				x: 5,
				y: 28,
				w: 43,
				props: {
					text: "Friday lineup starts at 7:00 PM. Feature screenings, creator panels, and after-show lounge access.",
				},
			},
			{
				type: "video",
				x: 54,
				y: 11,
				w: 41,
				props: {
					src: STOCK_VIDEO_TRAILER,
					alt: "Festival trailer",
					caption: "Tonight's Highlight Reel",
				},
				style: {
					borderRadius: "lg",
					shadowSize: "md",
					overlayEffect: "dim",
					overlayIntensity: 20,
				},
			},
			{
				type: "image",
				x: 5,
				y: 45,
				w: 44,
				props: {
					src: STOCK_IMAGE_CITY,
					alt: "Festival stage at night",
					caption: "Downtown Plaza Main Stage",
				},
				style: { borderRadius: "lg", shadowSize: "sm" },
			},
			{
				type: "list",
				x: 52,
				y: 64,
				w: 43,
				props: {
					items: [
						{ text: "6:30 PM  Gates Open" },
						{ text: "7:00 PM  Opening Film" },
						{ text: "9:15 PM  Director Q&A" },
						{ text: "10:00 PM  Rooftop Afterparty" },
					],
					ordered: false,
					inline: false,
				},
			},
			{
				type: "countdown",
				x: 52,
				y: 84,
				w: 43,
				props: {
					eventDate: "2026-12-31",
					eventTime: "23:59",
					showDays: true,
					showHours: true,
					showMinutes: true,
					showSeconds: false,
				},
				style: { scale: 90 },
			},
		],
	},
	{
		id: "lobby-status",
		label: "Lobby Status Board",
		description: "Corporate display with KPI card, timeline, and looped brand video.",
		resolution: { label: "1080p Landscape", width: 1920, height: 1080 },
		globalStyle: {
			themeMode: "light",
			primaryColor: "#0ea5e9",
			borderRadius: "md",
		},
		blocks: [
			{
				type: "badge",
				x: 6,
				y: 7,
				w: 20,
				props: { text: "DAILY BRIEF", variant: "default", appearance: "outline" },
			},
			{
				type: "heading",
				x: 6,
				y: 14,
				w: 58,
				props: { text: "North Tower Operations Dashboard" },
				style: { fontSize: "4xl", fontWeight: "bold" },
			},
			{
				type: "text",
				x: 6,
				y: 26,
				w: 48,
				props: {
					text: "Live occupancy, service queue metrics, and internal announcements for today's shift.",
				},
			},
			{
				type: "card",
				x: 6,
				y: 40,
				w: 34,
				props: {
					title: "Visitor Check-ins",
					text: "1,284 total entries today with an average front-desk wait time of 2m 14s.",
					buttonText: "View Report",
					buttonUrl: "#",
					imageSrc: STOCK_IMAGE_LOBBY,
					imageAlt: "Building lobby",
				},
			},
			{
				type: "timeline",
				x: 42,
				y: 36,
				w: 24,
				props: {
					timeline: [
						{
							title: "Morning Sync",
							subtitle: "08:30",
							description: "Cross-team standup and ticket review.",
							icon: "schedule",
						},
						{
							title: "Client Visit",
							subtitle: "11:00",
							description: "Facilities walk-through at level 18.",
							icon: "badge",
						},
						{
							title: "Security Drill",
							subtitle: "16:00",
							description: "Evacuation rehearsal for all departments.",
							icon: "shield",
						},
					],
				},
				style: { scale: 82 },
			},
			{
				type: "video",
				x: 68,
				y: 18,
				w: 27,
				props: {
					src: STOCK_VIDEO_LOBBY,
					alt: "Brand video loop",
					caption: "Campus Walkthrough",
				},
				style: { borderRadius: "lg", shadowSize: "sm" },
			},
			{
				type: "quote",
				x: 68,
				y: 67,
				w: 27,
				props: {
					text: "Operational excellence is built on visibility and consistency.",
					attribution: "Facilities Leadership",
				},
			},
		],
	},
	{
		id: "portrait-menu",
		label: "Portrait Menu Board",
		description: "Portrait signage layout for menu highlights with photo and kitchen reel.",
		resolution: { label: "Portrait HD", width: 1080, height: 1920 },
		globalStyle: {
			themeMode: "dark",
			primaryColor: "#34d399",
			borderRadius: "lg",
		},
		blocks: [
			{
				type: "badge",
				x: 8,
				y: 5,
				w: 30,
				props: { text: "TODAY'S MENU", variant: "default", appearance: "filled" },
			},
			{
				type: "heading",
				x: 8,
				y: 12,
				w: 84,
				props: { text: "Harbor Bistro" },
				style: { fontSize: "5xl", fontWeight: "bold" },
			},
			{
				type: "text",
				x: 8,
				y: 21,
				w: 84,
				props: {
					text: "Fresh coastal dishes prepared all day. Ask the host for allergen details.",
				},
			},
			{
				type: "image",
				x: 8,
				y: 30,
				w: 84,
				props: {
					src: STOCK_IMAGE_MENU,
					alt: "Featured dish",
					caption: "Chef's Catch of the Day",
				},
				style: { borderRadius: "lg", shadowSize: "md" },
			},
			{
				type: "list",
				x: 8,
				y: 58,
				w: 84,
				props: {
					items: [
						{ text: "Citrus Salmon Bowl  $18" },
						{ text: "Seared Tuna Tacos   $14" },
						{ text: "Grilled Veggie Wrap $12" },
						{ text: "Passionfruit Soda   $6" },
					],
					ordered: false,
					inline: false,
				},
			},
			{
				type: "video",
				x: 8,
				y: 75,
				w: 84,
				props: {
					src: STOCK_VIDEO_MENU,
					alt: "Kitchen reel",
					caption: "Kitchen Live Reel",
				},
				style: { borderRadius: "lg", overlayEffect: "vignette", overlayIntensity: 18 },
			},
			{
				type: "text",
				x: 8,
				y: 94,
				w: 84,
				props: {
					text: "Happy Hour 4:00 PM - 6:00 PM",
				},
				style: { fontSize: "xl", fontWeight: "bold", textAlign: "center" },
			},
		],
	},
];

const DEFAULT_GLOBAL_STYLE: GlobalStyle = {
	fontFamily: "Inter",
	primaryColor: "#00e5a0",
	colorScheme: "monochromatic",
	borderRadius: "md",
	themeMode: "dark",
};

const DEFAULT_CANVAS_BACKGROUND: CMSCanvasBackground = {
	type: "color",
	color: "#2f2f2f",
	imageUrl: "",
	videoUrl: "",
};

const DEFAULT_RESOLUTION: CMSResolution = CMS_PRESETS[0];
const DEFAULT_ZOOM = 100;

const DEFAULT_WIDTH_BY_TYPE: Partial<Record<CMSBlockType, number>> = {
	heading: 48,
	text: 42,
	card: 36,
	image: 42,
	video: 42,
	icon: 20,
	spacer: 30,
	divider: 38,
	badge: 28,
	list: 34,
	quote: 38,
	date: 58,
	countdown: 54,
	timeline: 62,
};

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function normalizeResolution(input: CMSResolution | null | undefined): CMSResolution {
	if (!input) return { ...DEFAULT_RESOLUTION };
	const width = clamp(Math.round(input.width), 320, 7680);
	const height = clamp(Math.round(input.height), 320, 4320);
	const label = input.label && input.label.trim().length > 0 ? input.label : "Custom";
	return { label, width, height };
}

function normalizeZoom(input: number): number {
	if (!Number.isFinite(input)) return DEFAULT_ZOOM;
	return clamp(Math.round(input), 50, 150);
}

function isCanvasBackgroundType(value: unknown): value is CMSCanvasBackgroundType {
	return value === "color" || value === "image" || value === "video";
}

function normalizeHexColor(value: unknown, fallback: string): string {
	if (typeof value !== "string") return fallback;
	const trimmed = value.trim();
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : fallback;
}

function normalizeCanvasBackground(input: unknown): CMSCanvasBackground {
	if (!input || typeof input !== "object") return { ...DEFAULT_CANVAS_BACKGROUND };

	const value = input as Partial<CMSCanvasBackground>;
	return {
		type: isCanvasBackgroundType(value.type) ? value.type : DEFAULT_CANVAS_BACKGROUND.type,
		color: normalizeHexColor(value.color, DEFAULT_CANVAS_BACKGROUND.color),
		imageUrl: typeof value.imageUrl === "string" ? value.imageUrl.trim() : "",
		videoUrl: typeof value.videoUrl === "string" ? value.videoUrl.trim() : "",
	};
}

function isCMSBlockType(value: unknown): value is CMSBlockType {
	return typeof value === "string" && CMS_ALLOWED_BLOCKS.includes(value as CMSBlockType);
}

function normalizeBlock(raw: unknown): CMSBlock | null {
	if (!raw || typeof raw !== "object") return null;
	const value = raw as Partial<CMSBlock>;
	if (!value.id || typeof value.id !== "string") return null;
	if (!isCMSBlockType(value.type)) return null;

	const x = typeof value.x === "number" ? clamp(value.x, 0, 100) : 40;
	const y = typeof value.y === "number" ? clamp(value.y, 0, 100) : 40;
	const width = typeof value.w === "number" ? clamp(value.w, 10, 100) : 32;

	return {
		id: value.id,
		type: value.type,
		props:
			value.props && typeof value.props === "object"
				? (value.props as Record<string, unknown>)
				: {},
		style:
			value.style && typeof value.style === "object"
				? (value.style as Partial<BlockStyle>)
				: {},
		x,
		y,
		w: width,
	};
}

function getStorage(): Storage | null {
	if (typeof window === "undefined") return null;
	return window.localStorage;
}

function createDefaultState(): CMSDisplayState {
	return {
		resolution: { ...DEFAULT_RESOLUTION },
		zoom: DEFAULT_ZOOM,
		blocks: [],
		selectedBlockId: null,
		activeTemplateId: null,
		canvasBackground: { ...DEFAULT_CANVAS_BACKGROUND },
		globalStyle: { ...DEFAULT_GLOBAL_STYLE },
		isHydrated: false,
	};
}

function getDefaultWidth(type: CMSBlockType): number {
	return clamp(DEFAULT_WIDTH_BY_TYPE[type] ?? 32, 10, 100);
}

function resolveTemplate(templateId: string): CMSTemplate | undefined {
	return CMS_TEMPLATE_LIBRARY.find((template) => template.id === templateId);
}

function createBlockFromTemplateSeed(seed: CMSTemplateBlockSeed): CMSBlock | null {
	if (!isCMSBlockType(seed.type)) return null;

	const registryEntry = BLOCK_REGISTRY[seed.type];
	if (!registryEntry) return null;

	const width = clamp(
		typeof seed.w === "number" ? Math.round(seed.w * 10) / 10 : getDefaultWidth(seed.type),
		10,
		100,
	);
	const x = clamp(seed.x, 0, 100 - width);
	const y = clamp(seed.y, 0, 100);

	return {
		id: nanoid(10),
		type: seed.type,
		props: {
			...registryEntry.defaultProps,
			...(seed.props ?? {}),
		},
		style: {
			...registryEntry.defaultStyle,
			...(seed.style ?? {}),
		},
		x,
		y,
		w: width,
	};
}

export const useDisplayStore = create<CMSDisplayState & CMSDisplayActions>()(
	immer((set, get) => {
		const persist = () => {
			const storage = getStorage();
			if (!storage) return;

			const state = get();
			const snapshot: CMSDisplaySnapshot = {
				resolution: state.resolution,
				zoom: state.zoom,
				blocks: state.blocks,
				selectedBlockId: state.selectedBlockId,
				activeTemplateId: state.activeTemplateId,
				canvasBackground: state.canvasBackground,
				globalStyle: state.globalStyle,
			};

			try {
				storage.setItem(CMS_DISPLAY_STORAGE_KEY, JSON.stringify(snapshot));
			} catch {
				// localStorage may be unavailable or quota-limited.
			}
		};

		return {
			...createDefaultState(),

			addBlock: (type: CMSBlockType) => {
				if (!CMS_ALLOWED_BLOCKS.includes(type)) return;

				const entry = BLOCK_REGISTRY[type];
				if (!entry) return;

				set((state) => {
					const width = getDefaultWidth(type);
					const next: CMSBlock = {
						id: nanoid(10),
						type,
						props: { ...entry.defaultProps },
						style: { ...entry.defaultStyle },
						x: clamp(50 - width / 2, 0, 100 - width),
						y: 42,
						w: width,
					};
					state.blocks.push(next);
					state.selectedBlockId = next.id;
				});

				persist();
			},

			removeBlock: (id: string) => {
				set((state) => {
					state.blocks = state.blocks.filter((block) => block.id !== id);
					if (state.selectedBlockId === id) {
						state.selectedBlockId = null;
					}
				});

				persist();
			},

			updateBlock: (id: string, patch: CMSBlockPatch) => {
				set((state) => {
					const block = state.blocks.find((entry) => entry.id === id);
					if (!block) return;

					if (patch.props) {
						block.props = { ...block.props, ...patch.props };
					}
					if (patch.style) {
						block.style = { ...block.style, ...patch.style };
					}
					if (typeof patch.x === "number") {
						block.x = clamp(patch.x, 0, 100 - block.w);
					}
					if (typeof patch.y === "number") {
						block.y = clamp(patch.y, 0, 100);
					}
					if (typeof patch.w === "number") {
						block.w = clamp(Math.round(patch.w * 10) / 10, 10, 100);
						block.x = clamp(block.x, 0, 100 - block.w);
					}
				});

				persist();
			},

			selectBlock: (id: string | null) => {
				set((state) => {
					state.selectedBlockId = id;
				});

				persist();
			},

			setResolution: (resolution: CMSResolution) => {
				const normalized = normalizeResolution(resolution);

				set((state) => {
					state.resolution = normalized;
				});

				persist();
			},

			setZoom: (zoom: number) => {
				const normalized = normalizeZoom(zoom);

				set((state) => {
					state.zoom = normalized;
				});

				persist();
			},

			setCanvasBackground: (patch: Partial<CMSCanvasBackground>) => {
				set((state) => {
					state.canvasBackground = normalizeCanvasBackground({
						...state.canvasBackground,
						...patch,
					});
				});

				persist();
			},

			applyTemplate: (templateId: string) => {
				const template = resolveTemplate(templateId);
				if (!template) return;

				const normalizedResolution = normalizeResolution(template.resolution);
				const seededBlocks = template.blocks
					.map((seed) => createBlockFromTemplateSeed(seed))
					.filter((block): block is CMSBlock => block !== null);

				set((state) => {
					state.resolution = normalizedResolution;
					state.zoom = DEFAULT_ZOOM;
					state.blocks = seededBlocks;
					state.selectedBlockId = null;
					state.activeTemplateId = template.id;
					if (template.globalStyle) {
						state.globalStyle = { ...DEFAULT_GLOBAL_STYLE, ...template.globalStyle };
					}
				});

				persist();
			},

			resetCanvas: () => {
				set((state) => {
					state.blocks = [];
					state.selectedBlockId = null;
					state.activeTemplateId = null;
				});

				persist();
			},

			saveToLocalStorage: () => {
				persist();
			},

			loadFromLocalStorage: () => {
				const storage = getStorage();
				if (!storage) {
					set((state) => {
						state.isHydrated = true;
					});
					return;
				}

				try {
					const raw =
						storage.getItem(CMS_DISPLAY_STORAGE_KEY) ??
						storage.getItem(LEGACY_DISPLAY_STORAGE_KEY);
					if (!raw) {
						set((state) => {
							state.isHydrated = true;
						});
						return;
					}

					const parsed = JSON.parse(raw) as Partial<CMSDisplaySnapshot>;
					const normalizedResolution = normalizeResolution(parsed.resolution);
					const normalizedZoom = normalizeZoom(parsed.zoom ?? DEFAULT_ZOOM);
					const normalizedBlocks = Array.isArray(parsed.blocks)
						? parsed.blocks
								.map((entry) => normalizeBlock(entry))
								.filter((entry): entry is CMSBlock => entry !== null)
						: [];
					const selectedBlockId =
						typeof parsed.selectedBlockId === "string" &&
						normalizedBlocks.some((block) => block.id === parsed.selectedBlockId)
							? parsed.selectedBlockId
							: null;
					const activeTemplateId =
						typeof parsed.activeTemplateId === "string" &&
						resolveTemplate(parsed.activeTemplateId)
							? parsed.activeTemplateId
							: null;
					const canvasBackground = normalizeCanvasBackground(parsed.canvasBackground);

					set((state) => {
						state.resolution = normalizedResolution;
						state.zoom = normalizedZoom;
						state.blocks = normalizedBlocks;
						state.selectedBlockId = selectedBlockId;
						state.activeTemplateId = activeTemplateId;
						state.canvasBackground = canvasBackground;
						state.globalStyle =
							parsed.globalStyle &&
							typeof parsed.globalStyle === "object" &&
							!Array.isArray(parsed.globalStyle)
								? { ...DEFAULT_GLOBAL_STYLE, ...(parsed.globalStyle as Partial<GlobalStyle>) }
								: { ...DEFAULT_GLOBAL_STYLE };
						state.isHydrated = true;
					});
				} catch {
					set((state) => {
						state.isHydrated = true;
					});
				}
			},
		};
	}),
);

