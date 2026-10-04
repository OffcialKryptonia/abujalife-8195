/**
 * Optional sprite-sheet overrides for the player character.
 * Drop a transparent PNG sheet (one row per pose, N frames wide) into the project
 * and register it here; PlayerCharacter will render it instead of the vector avatar
 * without any change to game logic. Empty by default.
 */
import type { Pose } from "@/components/game/PlayerCharacter";

export interface SpriteSet {
  url: string;
  frameW: number;
  frameH: number;
  /** row index + frame count + fps per pose */
  poses: Partial<Record<Pose, { row: number; frames: number; fps: number }>>;
  /** feet anchor in frame px */
  anchor: [number, number];
  /** world height in scene units */
  height: number;
}

/** Key: `${gender}:${outfit}` or `${gender}:*` */
export const SPRITE_SETS: Record<string, SpriteSet> = {};

export function spriteFor(gender: string, outfit: string): SpriteSet | undefined {
  return SPRITE_SETS[`${gender}:${outfit}`] ?? SPRITE_SETS[`${gender}:*`];
}
