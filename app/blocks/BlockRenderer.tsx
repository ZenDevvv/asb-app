import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import type { BlockComponentProps } from "~/types/editor";

export function BlockRenderer(props: BlockComponentProps) {
  const entry = BLOCK_REGISTRY[props.block.type];
  if (!entry) return null;

  const Component = entry.component;
  return <Component {...props} />;
}
