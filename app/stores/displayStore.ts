import { nanoid } from "nanoid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import type { BlockStyle, BlockType, GlobalStyle } from "~/types/editor";

export const CMS_DISPLAY_DRAFT_STORAGE_KEY_PREFIX = "asb-cms-display:";
export const CMS_PERSISTED_STATE_VERSION = 1;

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

export interface CMSPersistedState {
	version: 1;
	resolution: CMSResolution;
	zoom: number;
	blocks: CMSBlock[];
	activeTemplateId: string | null;
	canvasBackground: CMSCanvasBackground;
}

export interface CMSDisplaySnapshot extends CMSPersistedState {
	selectedBlockId: string | null;
	globalStyle: GlobalStyle;
}

interface CMSDisplayState extends CMSDisplaySnapshot {
	isHydrated: boolean;
	hydratedTemplateId: string | null;
}

export interface CMSBlockPatch {
	props?: Record<string, unknown>;
	style?: Partial<BlockStyle>;
	x?: number;
	y?: number;
	w?: number;
	h?: number;
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
	setGlobalStyle: (patch: Partial<GlobalStyle>) => void;
	resetCanvas: () => void;
	hydrateFromServer: (params: {
		templateId: string;
		cmsState: unknown;
		globalStyle: unknown;
	}) => void;
	hydrateFromLocalDraft: (params: {
		templateId: string;
		fallbackGlobalStyle?: unknown;
	}) => boolean;
	exportForServer: () => CMSPersistedState;
	getSnapshot: () => CMSDisplaySnapshot;
	saveDraftToLocalStorage: (templateId?: string) => void;
	clearDraftFromLocalStorage: (templateId?: string) => void;
}

interface CMSLocalDraftV1 {
	version: 1;
	savedAt: string;
	snapshot: CMSDisplaySnapshot;
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

const DEFAULT_CANVAS_BACKGROUND: CMSCanvasBackground = {
	type: "color",
	color: "#2f2f2f",
	imageUrl: "",
	videoUrl: "",
};

const BORDER_RADIUS_VALUES: Array<GlobalStyle["borderRadius"]> = ["none", "sm", "md", "lg", "full"];

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

function getStorage(): Storage | null {
	if (typeof window === "undefined") return null;
	return window.localStorage;
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

function getDefaultWidth(type: CMSBlockType): number {
	return clamp(DEFAULT_WIDTH_BY_TYPE[type] ?? 32, MIN_BLOCK_WIDTH, 100);
}

function getDefaultHeight(type: CMSBlockType): number {
	return clamp(DEFAULT_HEIGHT_BY_TYPE[type] ?? 18, MIN_BLOCK_HEIGHT, 100);
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

function normalizeGlobalStyle(input: unknown): GlobalStyle {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		return { ...DEFAULT_GLOBAL_STYLE };
	}

	const value = input as Partial<GlobalStyle>;
	const borderRadius =
		typeof value.borderRadius === "string" &&
		BORDER_RADIUS_VALUES.includes(value.borderRadius as GlobalStyle["borderRadius"])
			? (value.borderRadius as GlobalStyle["borderRadius"])
			: DEFAULT_GLOBAL_STYLE.borderRadius;

	return {
		fontFamily:
			typeof value.fontFamily === "string" && value.fontFamily.trim().length > 0
				? value.fontFamily
				: DEFAULT_GLOBAL_STYLE.fontFamily,
		primaryColor:
			typeof value.primaryColor === "string" && value.primaryColor.trim().length > 0
				? value.primaryColor
				: DEFAULT_GLOBAL_STYLE.primaryColor,
		colorScheme: "monochromatic",
		borderRadius,
		themeMode: value.themeMode === "light" ? "light" : "dark",
	};
}

export function normalizeCmsPersistedState(input: unknown): CMSPersistedState {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		return createDefaultCmsPersistedState();
	}

	const value = input as Partial<CMSPersistedState>;
	const blocks = Array.isArray(value.blocks)
		? value.blocks.map((entry) => normalizeBlock(entry)).filter((entry): entry is CMSBlock => entry !== null)
		: [];

	return {
		version: CMS_PERSISTED_STATE_VERSION,
		resolution: normalizeResolution(value.resolution),
		zoom: normalizeZoom(value.zoom ?? DEFAULT_ZOOM),
		blocks,
		activeTemplateId: typeof value.activeTemplateId === "string" ? value.activeTemplateId : null,
		canvasBackground: normalizeCanvasBackground(value.canvasBackground),
	};
}

export function createDefaultCmsPersistedState(): CMSPersistedState {
	return {
		version: CMS_PERSISTED_STATE_VERSION,
		resolution: { ...DEFAULT_RESOLUTION },
		zoom: DEFAULT_ZOOM,
		blocks: [],
		activeTemplateId: null,
		canvasBackground: { ...DEFAULT_CANVAS_BACKGROUND },
	};
}

function createDefaultSnapshot(): CMSDisplaySnapshot {
	return {
		...createDefaultCmsPersistedState(),
		selectedBlockId: null,
		globalStyle: { ...DEFAULT_GLOBAL_STYLE },
	};
}

function createDefaultState(): CMSDisplayState {
	return {
		...createDefaultSnapshot(),
		isHydrated: false,
		hydratedTemplateId: null,
	};
}

export function getCmsDisplayDraftStorageKey(templateId: string): string {
	return `${CMS_DISPLAY_DRAFT_STORAGE_KEY_PREFIX}${templateId}`;
}

function parseLocalDraft(raw: string): CMSDisplaySnapshot | null {
	try {
		const parsed = JSON.parse(raw) as Partial<CMSLocalDraftV1> | Partial<CMSDisplaySnapshot>;
		const source =
			parsed && typeof parsed === "object" && "snapshot" in parsed
				? (parsed.snapshot as Partial<CMSDisplaySnapshot>)
				: (parsed as Partial<CMSDisplaySnapshot>);

		if (!source || typeof source !== "object") return null;

		const persisted = normalizeCmsPersistedState(source);
		const selectedBlockId =
			typeof source.selectedBlockId === "string" &&
			persisted.blocks.some((block) => block.id === source.selectedBlockId)
				? source.selectedBlockId
				: null;

		return {
			...persisted,
			selectedBlockId,
			globalStyle: normalizeGlobalStyle(source.globalStyle),
		};
	} catch {
		return null;
	}
}

export const useDisplayStore = create<CMSDisplayState & CMSDisplayActions>()(
	immer((set, get) => {
		const persistDraft = (templateIdOverride?: string) => {
			const storage = getStorage();
			if (!storage) return;

			const state = get();
			const templateId = templateIdOverride ?? state.hydratedTemplateId;
			if (!templateId) return;

			const snapshot = state.getSnapshot();
			const payload: CMSLocalDraftV1 = {
				version: CMS_PERSISTED_STATE_VERSION,
				savedAt: new Date().toISOString(),
				snapshot,
			};

			try {
				storage.setItem(getCmsDisplayDraftStorageKey(templateId), JSON.stringify(payload));
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

				persistDraft();
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
						x: clamp(source.x + BLOCK_DUPLICATE_OFFSET, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX),
						y: clamp(source.y + BLOCK_DUPLICATE_OFFSET, BLOCK_POSITION_MIN, BLOCK_POSITION_MAX),
						w: source.w,
						h: source.h,
					};

					state.blocks.push(duplicate);
					state.selectedBlockId = duplicate.id;
				});

				persistDraft();
			},

			removeBlock: (id: string) => {
				set((state) => {
					state.blocks = state.blocks.filter((block) => block.id !== id);
					if (state.selectedBlockId === id) {
						state.selectedBlockId = null;
					}
				});

				persistDraft();
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

				persistDraft();
			},

			selectBlock: (id: string | null) => {
				set((state) => {
					state.selectedBlockId = id;
				});

				persistDraft();
			},

			setResolution: (resolution: CMSResolution) => {
				const normalized = normalizeResolution(resolution);

				set((state) => {
					state.resolution = normalized;
				});

				persistDraft();
			},

			setZoom: (zoom: number) => {
				const normalized = normalizeZoom(zoom);

				set((state) => {
					state.zoom = normalized;
				});

				persistDraft();
			},

			setCanvasBackground: (patch: Partial<CMSCanvasBackground>) => {
				set((state) => {
					state.canvasBackground = normalizeCanvasBackground({
						...state.canvasBackground,
						...patch,
					});
				});

				persistDraft();
			},

			setGlobalStyle: (patch: Partial<GlobalStyle>) => {
				set((state) => {
					state.globalStyle = normalizeGlobalStyle({ ...state.globalStyle, ...patch });
				});

				persistDraft();
			},

			resetCanvas: () => {
				set((state) => {
					state.blocks = [];
					state.selectedBlockId = null;
					state.activeTemplateId = null;
				});

				persistDraft();
			},

			hydrateFromServer: ({ templateId, cmsState, globalStyle }) => {
				const persisted = normalizeCmsPersistedState(cmsState);
				const nextGlobalStyle = normalizeGlobalStyle(globalStyle);

				set((state) => {
					state.version = CMS_PERSISTED_STATE_VERSION;
					state.resolution = persisted.resolution;
					state.zoom = persisted.zoom;
					state.blocks = persisted.blocks;
					state.activeTemplateId = persisted.activeTemplateId;
					state.canvasBackground = persisted.canvasBackground;
					state.globalStyle = nextGlobalStyle;
					state.selectedBlockId = null;
					state.hydratedTemplateId = templateId;
					state.isHydrated = true;
				});

				persistDraft(templateId);
			},

			hydrateFromLocalDraft: ({ templateId, fallbackGlobalStyle }) => {
				const storage = getStorage();
				if (!storage) return false;

				const raw = storage.getItem(getCmsDisplayDraftStorageKey(templateId));
				if (!raw) return false;

				const parsedSnapshot = parseLocalDraft(raw);
				if (!parsedSnapshot) return false;

				const mergedGlobalStyle = parsedSnapshot.globalStyle
					? parsedSnapshot.globalStyle
					: normalizeGlobalStyle(fallbackGlobalStyle);

				set((state) => {
					state.version = CMS_PERSISTED_STATE_VERSION;
					state.resolution = parsedSnapshot.resolution;
					state.zoom = parsedSnapshot.zoom;
					state.blocks = parsedSnapshot.blocks;
					state.activeTemplateId = parsedSnapshot.activeTemplateId;
					state.canvasBackground = parsedSnapshot.canvasBackground;
					state.selectedBlockId = parsedSnapshot.selectedBlockId;
					state.globalStyle = mergedGlobalStyle;
					state.hydratedTemplateId = templateId;
					state.isHydrated = true;
				});

				return true;
			},

			exportForServer: () => {
				const state = get();
				return {
					version: CMS_PERSISTED_STATE_VERSION,
					resolution: normalizeResolution(state.resolution),
					zoom: normalizeZoom(state.zoom),
					blocks: state.blocks.map((block) => ({
						...block,
						props: { ...block.props },
						style: { ...block.style },
					})),
					activeTemplateId: state.activeTemplateId,
					canvasBackground: normalizeCanvasBackground(state.canvasBackground),
				};
			},

			getSnapshot: () => {
				const state = get();
				return {
					...state.exportForServer(),
					selectedBlockId: state.selectedBlockId,
					globalStyle: { ...state.globalStyle },
				};
			},

			saveDraftToLocalStorage: (templateId?: string) => {
				persistDraft(templateId);
			},

			clearDraftFromLocalStorage: (templateId?: string) => {
				const storage = getStorage();
				if (!storage) return;
				const targetTemplateId = templateId ?? get().hydratedTemplateId;
				if (!targetTemplateId) return;
				try {
					storage.removeItem(getCmsDisplayDraftStorageKey(targetTemplateId));
				} catch {
					// localStorage may be unavailable or quota-limited.
				}
			},
		};
	}),
);
