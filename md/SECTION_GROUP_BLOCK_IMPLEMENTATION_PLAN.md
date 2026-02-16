# Section -> Group -> Block Implementation Plan (Group-Relative Absolute)

## Status
- Implemented in `asb-app` (section/group/block model is now active).
- This supersedes the previous plan that assumed section-relative absolute blocks.
- Keep this file as the architecture baseline and change checklist for future extensions.

## Alignment Audit (Pre-Implementation Snapshot)
Current design and code still use section-scoped layout and section-relative absolute behavior:
- Guide states absolute blocks are section-relative in multiple places.
- Store and renderer currently keep one `section.layout` and one flat `section.blocks` list.
- Add Block modal targets section slots and then optionally flags the new block as absolute.

This plan updates the target architecture to keep behavior coherent after introducing groups.

## Goal
Implement `section -> group -> block` with:
- Groups stacked vertically inside each section.
- Each group owning its own layout and block composition.
- Absolute blocks positioned relative to their parent group (not section).

## Non-Negotiable Architecture Invariants (No Bandaids)
1. Use one authoritative ownership path: `Section.groups[].blocks[]`.
2. Use one coordinate space for absolute blocks: parent group local space.
3. Keep layout memory at group scope only; do not remap other groups during one group layout switch.
4. Keep migration one-way: read legacy section model, normalize to grouped model, stop writing legacy fields.
5. Avoid dual render paths beyond migration boundary.

## Scope
In scope:
- Data model refactor to support groups.
- Selection model expansion: section/group/block.
- Group CRUD and group settings UI.
- Group-scoped flow/absolute block behavior.
- Group-scoped layout memory.
- LocalStorage migration for existing projects.
- Undo/redo consistency for group-aware mutations and absolute dragging.
- Preview parity with editor.

Out of scope (phase 1):
- Nested groups.
- Cross-group drag on canvas (can be later).
- Group-specific visibility/animation rules.

## Target Data Model

### Core Types
```ts
interface Section {
  id: string;
  type: SectionType;
  groups: Group[];
  style: SectionStyle;
  isVisible: boolean;
}

interface Group {
  id: string;
  label: string;
  order: number;
  layout: LayoutTemplate;
  blocks: Block[]; // flow + absolute; filter by block.style.positionMode
  style?: GroupStyle;
  layoutSlotMemory?: LayoutSlotMemory; // legacy fallback, optional
  layoutSlotMemories?: Record<string, LayoutSlotMemory>;
}

interface GroupStyle {
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: "content" | "wide" | "full";
  verticalAlign?: "top" | "center" | "bottom";
}
```

### Block Semantics
- Flow block: `block.style.positionMode !== "absolute"` and must map to a group layout slot.
- Absolute block: `block.style.positionMode === "absolute"` and uses group-local `positionX/positionY/zIndex/scale`.
- For absolute blocks, `slot` should be ignored by renderer and layout-memory logic.

## Selection Model
Add third selection state:
- `selectedSectionId`
- `selectedGroupId`
- `selectedBlockId`

Rules:
- `selectSection(id)` clears `selectedGroupId` and `selectedBlockId`.
- `selectGroup(sectionId, groupId)` sets section + group, clears block.
- `selectBlock(sectionId, groupId, blockId)` always carries group context.

## Migration Strategy (Legacy -> Grouped)

### Legacy input
Current saved state uses section-level:
- `section.layout`
- `section.blocks`

### Migration algorithm
For each section:
1. If `section.groups` exists and valid, keep as-is.
2. Else create one default group:
- `group.layout = section.layout`
- `group.blocks = section.blocks` (flow + absolute preserved)
- `group.order = 0`
- `group.label = "Main Group"`
3. Normalize group block order per slot for flow blocks only.
4. Persist only grouped shape on next save.

Why this is safe:
- Legacy sections have one layout region, so converting to one group preserves relative geometry for both flow and absolute blocks.

## Store Refactor Plan

### Section actions (retain)
- `addSection`, `removeSection`, `duplicateSection`, `reorderSections`
- `updateSectionStyle`, `toggleSectionVisibility`

### Group actions (new)
- `addGroup(sectionId, layoutId?, index?)`
- `removeGroup(sectionId, groupId)`
- `duplicateGroup(sectionId, groupId)`
- `reorderGroups(sectionId, fromIndex, toIndex)`
- `renameGroup(sectionId, groupId, label)`
- `updateGroupLayout(sectionId, groupId, layoutId)`
- `updateGroupStyle(sectionId, groupId, style)`

### Block actions (group-aware)
- `addBlock(sectionId, groupId, blockType, slot?, options?)`
- `removeBlock(sectionId, groupId, blockId)`
- `reorderBlocks(sectionId, groupId, fromIndex, toIndex)`
- `updateBlockProp(sectionId, groupId, blockId, key, value)`
- `updateBlockStyle(sectionId, groupId, blockId, style)`

Notes:
- `options` includes `addAsAbsolute`.
- Absolute mode toggle must keep block in same group.

### History and debounce
- Keep existing history snapshot strategy.
- Absolute drag debounce key becomes `sectionId:groupId:blockId`.
- Final pointer-up coordinates must still be committed before drag end.

## Group-Scoped Layout Memory
Current memory is section-scoped; change to group-scoped:
- `group.layoutSlotMemories[layoutId]`

Rules:
- On group layout switch, remap only flow blocks in that group.
- Absolute blocks in that group are unaffected.
- No other group in the section should change.
- Keep navbar semantic mapping rules, but apply them within the active group only.

## Rendering Plan

### Component split
- Keep `SectionRenderer` as section shell and group stack orchestrator.
- Add `GroupRenderer` for group layout and group-local absolute overlay.

### Render order
1. Section container/background.
2. Groups in `order` sequence (vertical stack).
3. Per group:
- render flow blocks by slot.
- render group-local absolute blocks in a group-local overlay (`position: relative` on group root).

### Drag behavior
- Pointer drag math for absolute blocks uses the active group's bounding box.
- Disable text selection and non-active hover reactions while dragging (same UX expectation as current design).

## Editor UI Plan

### Right sidebar modes
1. Section mode:
- section style/background controls.
- group list and group CRUD.
2. Group mode:
- group layout picker.
- group blocks list.
- add block button and group style controls.
3. Block mode:
- existing content/style controls.
- position controls now explicitly labeled "Group Relative" for absolute mode.

### Add Block flow
- Open modal from selected group context.
- Slot picker reads `selectedGroup.layout.slots`.
- `Add as absolute block` adds to selected group and initializes group-local coordinates.

### Canvas selection flow
- Click section shell -> section mode.
- Click group chrome/header -> group mode.
- Click block -> block mode.

## Registry Updates
Move from `defaultBlocks` to `defaultGroups` in section registry:
```ts
defaultGroups: Array<{
  label: string;
  layoutId: string;
  blocks: Omit<Block, "id">[];
}>;
```
Transition rule:
- During migration, wrap existing `defaultBlocks` into one `defaultGroups[0]`.

## Preview and Persistence
- Preview route should render from grouped model only.
- `loadFromLocalStorage` must normalize legacy shape once.
- `saveToLocalStorage` should write grouped shape only.

## Test Plan

### Unit tests
- Migration: legacy section -> grouped section.
- Group layout remap determinism for repeated switches.
- Absolute drag update path with group-local coordinates.
- Selection reducer transitions for section/group/block.

### Integration tests
- Add/remove/reorder groups.
- Add flow block to chosen group slot.
- Add absolute block to chosen group and drag/undo/redo.
- Ensure changing Group A layout does not mutate Group B blocks.

### Regression checklist
- Existing localStorage projects open without content loss.
- Navbar semantic slot logic still behaves correctly when navbar has one or more groups.
- Preview output matches editor content structure.

## Delivery Phases

### Phase 0 - Safety and contracts
- Add grouped types and migration helper.
- Add temporary compatibility read path.
- Add tests for migration and group memory primitives.

### Phase 1 - Store and renderer
- Move store mutations to grouped model.
- Implement `GroupRenderer` and group-local absolute dragging.

### Phase 2 - UI behavior
- Introduce group mode in right sidebar.
- Make Add Block modal group-aware.
- Add group list CRUD and reorder UX.

### Phase 3 - Cleanup
- Remove legacy section-level block/layout writes.
- Keep one canonical grouped persistence shape.
- Update docs and prompt guide to final behavior.

## Explicit Anti-Misalignment Gates
Do not start implementation phase 1 unless these are agreed and documented:
1. Absolute blocks are group-relative (final decision).
2. Group layout switching only affects that group.
3. No permanent dual-write to legacy section-level fields.
4. Right sidebar supports section/group/block settings modes.

## Acceptance Criteria
- A section can contain multiple vertically stacked groups.
- Each group has independent layout, block list, and layout-memory behavior.
- Flow blocks are inserted into selected group + selected slot.
- Absolute blocks are inserted into and positioned within the selected group.
- Undo/redo captures final absolute drop position in group-local coordinates.
- Repeated layout switching in one group does not scramble other groups.
- Legacy projects migrate without content loss.

## Post-Implementation Documentation Updates
Update `asb-app/md/ASB_PROMPT_GUIDE.md` to reflect:
- section/group/block hierarchy.
- three-level selection model.
- group-relative absolute behavior.
- group-scoped layout memory.
- updated Add Block modal semantics.
- new settings panel modes and keyboard behavior (if changed).
