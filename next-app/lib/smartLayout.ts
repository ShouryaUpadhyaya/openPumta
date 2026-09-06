import { TextBox } from '@/types/space';
import { Viewport } from '@/hooks/useViewport';

export const BOX_WIDTH = 400;
export const BOX_HEIGHT = 300;
export const PADDING = 24;
export const SPACING = 20;
export const MIN_WIDTH = 320;
export const MIN_HEIGHT = 240;

export interface Rect {
  id?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  positionSource?: 'auto' | 'user' | 'auto_paste';
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

function dwindle(
  rect: Rect,
  boxes: TextBox[],
  viewport: Viewport,
  isFirstBox = false,
): { id: number; layout: any }[] {
  if (boxes.length === 0) return [];
  if (boxes.length === 1) {
    const box = boxes[0];
    const existingLayout = box.layout || {};
    const existingViewportLayout = existingLayout[viewport] || existingLayout.desktop || {};

    // For the very first box on an empty canvas, make it centered and 75% size
    let finalRect = { ...rect };
    if (isFirstBox) {
      finalRect.width = Math.max(MIN_WIDTH, rect.width * 0.75);
      finalRect.height = Math.max(MIN_HEIGHT, rect.height * 0.75);
      finalRect.x = rect.x + (rect.width - finalRect.width) / 2;
      finalRect.y = rect.y + (rect.height - finalRect.height) / 2;
    }

    return [
      {
        id: box.id,
        layout: {
          ...existingLayout,
          [viewport]: {
            ...existingViewportLayout,
            x: finalRect.x,
            y: finalRect.y,
            width: Math.max(MIN_WIDTH, finalRect.width),
            height: Math.max(MIN_HEIGHT, finalRect.height),
            positionSource: 'auto',
          },
        },
      },
    ];
  }

  // Split the rect based on aspect ratio
  const isHorizontalSplit = rect.width > rect.height * 1.1;

  const halfBoxesCount = Math.ceil(boxes.length / 2);
  const firstHalfBoxes = boxes.slice(0, halfBoxesCount);
  const secondHalfBoxes = boxes.slice(halfBoxesCount);

  let firstHalf: Rect;
  let secondHalf: Rect;

  if (isHorizontalSplit) {
    const halfWidth = (rect.width - SPACING) / 2;
    firstHalf = { ...rect, width: halfWidth };
    secondHalf = { ...rect, x: rect.x + halfWidth + SPACING, width: halfWidth };
  } else {
    const halfHeight = (rect.height - SPACING) / 2;
    firstHalf = { ...rect, height: halfHeight };
    secondHalf = { ...rect, y: rect.y + halfHeight + SPACING, height: halfHeight };
  }

  return [
    ...dwindle(firstHalf, firstHalfBoxes, viewport, false),
    ...dwindle(secondHalf, secondHalfBoxes, viewport, false),
  ];
}

export function calculateAutoLayout(
  allTextBoxes: TextBox[],
  boxesToPlace: TextBox[],
  canvasW: number,
  viewport: Viewport,
  canvasH: number = 800,
): { id: number; layout: any }[] {
  if (boxesToPlace.length === 0) return [];
  if (viewport === 'mobile') return [];

  // Identify obstacles (boxes that have user-controlled position/size)
  const boxesToPlaceIds = new Set(boxesToPlace.map((b) => b.id));
  const userBoxes = allTextBoxes
    .filter((b) => {
      if (boxesToPlaceIds.has(b.id)) return false;
      const l = (b.layout?.[viewport] || b.layout?.desktop || {}) as any;
      return l.positionSource === 'user' || l.positionSource === 'auto_paste';
    })
    .map((b) => {
      const l = (b.layout?.[viewport] || b.layout?.desktop || {}) as any;
      return {
        x: l.x || 0,
        y: l.y || 0,
        width: l.width || MIN_WIDTH,
        height: l.height || MIN_HEIGHT,
      };
    });

  // Calculate startY to avoid user boxes (simplified layout fallback)
  let startY = PADDING;
  if (userBoxes.length > 0) {
    const maxY = Math.max(...userBoxes.map((b) => b.y + b.height));
    startY = Math.max(PADDING, maxY + SPACING);
  }

  // Calculate required area based on the actual layout heights
  const totalAreaNeeded = boxesToPlace.reduce((acc, b) => {
    const l = (b.layout?.[viewport] || b.layout?.desktop || {}) as any;
    const h = Math.max(MIN_HEIGHT, l.height || MIN_HEIGHT);
    const w = Math.max(MIN_WIDTH, l.width || MIN_WIDTH);
    return acc + w * h * 1.5; // Add 50% buffer for spacing and imperfect splits
  }, 0);

  const estimatedH = Math.ceil(totalAreaNeeded / Math.max(1, canvasW - PADDING * 2));
  const finalCanvasH = Math.max(canvasH, estimatedH + startY + PADDING);

  const availableHeight = Math.max(MIN_HEIGHT * 2, finalCanvasH - startY - PADDING);

  const rect: Rect = {
    x: PADDING,
    y: startY,
    width: Math.max(MIN_WIDTH * 2, canvasW - PADDING * 2),
    height: availableHeight,
  };

  const isFirstBox = allTextBoxes.length === 1 && boxesToPlace.length === 1;

  return dwindle(rect, boxesToPlace, viewport, isFirstBox);
}
