import { describe, it, expect } from 'vitest';
import { calculateAutoLayout, overlaps, Rect, BOX_WIDTH, BOX_HEIGHT } from './layoutAlgorithm';
import { TextBox } from '@/types/space';

describe('layoutAlgorithm', () => {
  it('overlaps returns true if rects intersect', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 50, y: 50, width: 100, height: 100 };
    expect(overlaps(a, b)).toBe(true);
  });

  it('overlaps returns false if rects are far apart', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 200, y: 0, width: 100, height: 100 };
    expect(overlaps(a, b)).toBe(false);
  });

  it('calculateAutoLayout places boxes correctly on an empty canvas', () => {
    const canvasW = 1200;
    const boxesToPlace = [{ id: 1, layout: {} }] as TextBox[];

    const updates = calculateAutoLayout([], boxesToPlace, canvasW, 'desktop');
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe(1);

    const layout = updates[0].layout.desktop;
    expect(layout.positionSource).toBe('auto');
    expect(layout.width).toBe(BOX_WIDTH);
    expect(layout.height).toBe(BOX_HEIGHT);
  });

  it('calculateAutoLayout avoids obstacles', () => {
    const canvasW = 1200;
    // Put an obstacle at x=20, y=20 (which is the default first slot starting point)
    const existing = [
      { id: 10, layout: { desktop: { x: 20, y: 20, width: BOX_WIDTH, height: BOX_HEIGHT } } },
    ] as TextBox[];

    const boxesToPlace = [{ id: 1, layout: {} }] as TextBox[];

    const updates = calculateAutoLayout(existing, boxesToPlace, canvasW, 'desktop');
    expect(updates).toHaveLength(1);

    const layout = updates[0].layout.desktop;
    expect(
      overlaps(
        { x: layout.x, y: layout.y, width: layout.width, height: layout.height },
        { x: 20, y: 20, width: BOX_WIDTH, height: BOX_HEIGHT },
      ),
    ).toBe(false);
  });
});
