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
	h: number;
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
	h?: number;
}

export interface CMSTemplateBlockSeed {
	type: CMSBlockType;
	x: number;
	y: number;
	w?: number;
	h?: number;
	props?: Record<string, unknown>;
	style?: Partial<BlockStyle>;
}

export interface CMSTemplate {
	id: string;
	label: string;
	description: string;
	resolution: CMSResolution;
	globalStyle?: Partial<GlobalStyle>;
	canvasBackground?: Partial<CMSCanvasBackground>;
	blocks: CMSTemplateBlockSeed[];
}

interface CMSDisplayState extends CMSDisplaySnapshot {
	isHydrated: boolean;
}

interface CMSDisplayActions {
	addBlock: (type: CMSBlockType) => void;
	duplicateBlock: (id: string) => void;
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

export const CMS_TEMPLATE_LIBRARY: CMSTemplate[] = [
	{
		id: "portrait-menu",
		label: "Canvas Background as a video",
		description: "Imported from CMS debug snapshot with portrait video background.",
		resolution: { label: "Portrait HD", width: 1080, height: 1920 },
		globalStyle: {
			themeMode: "dark",
			primaryColor: "#34d399",
			borderRadius: "lg",
		},
		canvasBackground: {
			type: "video",
			color: "#2e2e2e",
			imageUrl: "",
			videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
		},
		blocks: [
			{
				type: "heading",
				x: 6.997464496507647,
				y: 65.7768571677105,
				w: 74.8,
				h: 30,
				props: {
					text: "Canvas Background as a video",
					textStyle: "default",
					containerHorizontalAlign: "center",
					containerVerticalAlign: "middle",
				},
				style: {
					fontSize: "custom",
					fontWeight: "bold",
					fontStyle: "normal",
					letterSpacing: 0,
					textAlign: "left",
					fontFamily: "EB Garamond",
					fontSizePx: 120,
				},
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

const DEFAULT_HEIGHT_BY_TYPE: Partial<Record<CMSBlockType, number>> = {
	heading: 16,
	text: 18,
	card: 28,
	image: 30,
	video: 30,
	icon: 12,
	spacer: 10,
	divider: 10,
	badge: 12,
	list: 24,
	quote: 20,
	date: 18,
	countdown: 18,
	timeline: 26,
};

const MIN_BLOCK_WIDTH = 8;
const MIN_BLOCK_HEIGHT = 6;
const BLOCK_POSITION_MIN = -200;
const BLOCK_POSITION_MAX = 200;
const BLOCK_DUPLICATE_OFFSET = 2;

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

	const defaultHeight = getDefaultHeight(value.type);
	const x =
		typeof value.x === "number"
			? clamp(value.x, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX)
			: 40;
	const y =
		typeof value.y === "number"
			? clamp(value.y, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX)
			: 40;
	const width = typeof value.w === "number" ? clamp(value.w, MIN_BLOCK_WIDTH, 100) : 32;
	const height =
		typeof value.h === "number" ? clamp(value.h, MIN_BLOCK_HEIGHT, 100) : defaultHeight;

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
		h: height,
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
	return clamp(DEFAULT_WIDTH_BY_TYPE[type] ?? 32, MIN_BLOCK_WIDTH, 100);
}

function getDefaultHeight(type: CMSBlockType): number {
	return clamp(DEFAULT_HEIGHT_BY_TYPE[type] ?? 18, MIN_BLOCK_HEIGHT, 100);
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
		MIN_BLOCK_WIDTH,
		100,
	);
	const height = clamp(
		typeof seed.h === "number" ? Math.round(seed.h * 10) / 10 : getDefaultHeight(seed.type),
		MIN_BLOCK_HEIGHT,
		100,
	);
	const x = clamp(seed.x, 0, 100 - width);
	const y = clamp(seed.y, 0, 100 - height);

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
		h: height,
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
					const height = getDefaultHeight(type);
					const next: CMSBlock = {
						id: nanoid(10),
						type,
						props: { ...entry.defaultProps },
						style: { ...entry.defaultStyle },
						x: clamp(50 - width / 2, 0, 100 - width),
						y: clamp(42, 0, 100 - height),
						w: width,
						h: height,
					};
					state.blocks.push(next);
					state.selectedBlockId = next.id;
				});

				persist();
			},

			duplicateBlock: (id: string) => {
				set((state) => {
					const source = state.blocks.find((block) => block.id === id);
					if (!source) return;

					const duplicate: CMSBlock = {
						id: nanoid(10),
						type: source.type,
						props: { ...source.props },
						style: { ...source.style },
						x: clamp(
							source.x + BLOCK_DUPLICATE_OFFSET,
							BLOCK_POSITION_MIN,
							BLOCK_POSITION_MAX,
						),
						y: clamp(
							source.y + BLOCK_DUPLICATE_OFFSET,
							BLOCK_POSITION_MIN,
							BLOCK_POSITION_MAX,
						),
						w: source.w,
						h: source.h,
					};

					state.blocks.push(duplicate);
					state.selectedBlockId = duplicate.id;
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
						block.x = clamp(patch.x, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX);
					}
					if (typeof patch.y === "number") {
						block.y = clamp(patch.y, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX);
					}
					if (typeof patch.w === "number") {
						block.w = clamp(Math.round(patch.w * 10) / 10, MIN_BLOCK_WIDTH, 100);
					}
					if (typeof patch.h === "number") {
						block.h = clamp(Math.round(patch.h * 10) / 10, MIN_BLOCK_HEIGHT, 100);
					}
					block.x = clamp(block.x, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX);
					block.y = clamp(block.y, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX);
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
				const normalizedTemplateBackground = template.canvasBackground
					? normalizeCanvasBackground(template.canvasBackground)
					: { ...DEFAULT_CANVAS_BACKGROUND };
				const normalizedTemplateGlobalStyle = template.globalStyle
					? { ...DEFAULT_GLOBAL_STYLE, ...template.globalStyle }
					: { ...DEFAULT_GLOBAL_STYLE };

				set((state) => {
					state.resolution = normalizedResolution;
					state.zoom = DEFAULT_ZOOM;
					state.blocks = seededBlocks;
					state.selectedBlockId = null;
					state.activeTemplateId = template.id;
					state.canvasBackground = normalizedTemplateBackground;
					state.globalStyle = normalizedTemplateGlobalStyle;
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

