const SECTION_DND_PREFIX = "section:";
const GROUP_DND_PREFIX = "group:";

export function toSectionDndId(sectionId: string) {
  return `${SECTION_DND_PREFIX}${sectionId}`;
}

export function toGroupDndId(sectionId: string, groupId: string) {
  return `${GROUP_DND_PREFIX}${sectionId}:${groupId}`;
}

export function parseSectionDndId(value: string): string | null {
  if (!value.startsWith(SECTION_DND_PREFIX)) return null;
  return value.slice(SECTION_DND_PREFIX.length);
}

export function parseGroupDndId(value: string): { sectionId: string; groupId: string } | null {
  if (!value.startsWith(GROUP_DND_PREFIX)) return null;
  const payload = value.slice(GROUP_DND_PREFIX.length);
  const separatorIndex = payload.indexOf(":");
  if (separatorIndex === -1) return null;

  const sectionId = payload.slice(0, separatorIndex);
  const groupId = payload.slice(separatorIndex + 1);
  if (!sectionId || !groupId) return null;

  return { sectionId, groupId };
}
