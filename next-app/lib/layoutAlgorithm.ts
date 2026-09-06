import { TextBox } from '@/types/space';
import { Viewport } from '@/hooks/useViewport';

export const BOX_WIDTH = 400;
export const BOX_HEIGHT = 300;
export const PADDING = 20;
export const SPACING = 20;

export interface Rect {
  id?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  positionSource?: 'auto' | 'user';
}

/** Check if two rects overlap (with spacing gap) */
export function overlaps(a: Rect, b: Rect, spacing = SPACING): boolean {
  return !(
    a.x + a.width + spacing <= b.x ||
    b.x + b.width + spacing <= a.x ||
    a.y + a.height + spacing <= b.y ||
    b.y + b.height + spacing <= a.y
  );
}

/**
 * Calculates grid-based placement for a set of textboxes, routing around obstacles.
 * Returns an array of layout updates for the boxes that were re-positioned.
 */
export function calculateAutoLayout(
  allTextBoxes: TextBox[],
  boxesToPlace: TextBox[],
  canvasW: number,
  viewport: Viewport,
): { id: number; layout: any }[] {
  if (boxesToPlace.length === 0) return [];
  if (viewport === 'mobile') return []; // Auto layout grid doesn't apply to mobile

  // 1. Identify obstacles (all boxes that are NOT in boxesToPlace)
  const boxesToPlaceIds = new Set(boxesToPlace.map((b) => b.id));

  const obstacles: Rect[] = allTextBoxes
    .filter((b) => !boxesToPlaceIds.has(b.id))
    .map((b) => {
      const l = b.layout?.[viewport] ||
        b.layout?.desktop || { x: 0, y: 0, width: BOX_WIDTH, height: BOX_HEIGHT };
      return {
        id: b.id,
        x: l.x || 0,
        y: l.y || 0,
        width: typeof l.width === 'number' ? l.width : BOX_WIDTH,
        height: typeof l.height === 'number' ? l.height : BOX_HEIGHT,
      };
    });

  // Calculate grid columns
  const availableWidth = Math.max(canvasW - PADDING * 2, BOX_WIDTH);
  const maxCols = Math.max(1, Math.floor((availableWidth + SPACING) / (BOX_WIDTH + SPACING)));
  const totalGridWidth = maxCols * BOX_WIDTH + (maxCols - 1) * SPACING;

  // Center the grid on the canvas if there's extra space
  const startX = Math.max(PADDING, (canvasW - totalGridWidth) / 2);

  const updates: { id: number; layout: any }[] = [];

  let currentGridIndex = 0; // The virtual cell index in the grid

  for (const box of boxesToPlace) {
    const boxW = BOX_WIDTH; // We assume standard width for auto-placed boxes
    const boxH = BOX_HEIGHT;
    let placed = false;

    while (!placed) {
      const col = currentGridIndex % maxCols;
      const row = Math.floor(currentGridIndex / maxCols);

      const candidate: Rect = {
        x: startX + col * (BOX_WIDTH + SPACING),
        y: PADDING + row * (BOX_HEIGHT + SPACING),
        width: boxW,
        height: boxH,
      };

      // Check against obstacles and ALREADY PLACED boxes in this run
      const hasCollision =
        obstacles.some((obs) => overlaps(candidate, obs)) ||
        updates.some((u) => {
          const ul = u.layout[viewport];
          return overlaps(candidate, {
            x: ul.x,
            y: ul.y,
            width: typeof ul.width === 'number' ? ul.width : BOX_WIDTH,
            height: typeof ul.height === 'number' ? ul.height : BOX_HEIGHT,
          });
        });

      if (!hasCollision) {
        // Place it here!
        const existingLayout = box.layout || {};
        const existingViewportLayout = existingLayout[viewport] || existingLayout.desktop || {};

        updates.push({
          id: box.id,
          layout: {
            ...existingLayout,
            [viewport]: {
              ...existingViewportLayout,
              x: candidate.x,
              y: candidate.y,
              width: boxW,
              height: boxH,
              positionSource: 'auto', // explicitly mark as auto
            },
          },
        });
        placed = true;
      }

      currentGridIndex++; // Move to next grid slot
    }
  }

  return updates;
}
