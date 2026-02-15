import type { BlockComponentProps } from "~/types/editor";

export function SpacerBlock({ block }: BlockComponentProps) {
  const height = block.style.height ?? 32;

  return <div style={{ height }} />;
}
