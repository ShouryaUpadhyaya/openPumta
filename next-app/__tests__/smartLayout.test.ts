import { describe, it, expect } from 'vitest';
import { calculateAutoLayout } from '../lib/smartLayout';

describe('smartLayout', () => {
  it('should increase canvas height and avoid overlapping when handling tall boxes', () => {
    // 3 boxes with large height
    const boxes = [
      {
        id: 1,
        spaceId: 1,
        content: '',
        layout: { desktop: { positionSource: 'auto', height: 400, width: 400 } },
      },
      {
        id: 2,
        spaceId: 1,
        content: '',
        layout: { desktop: { positionSource: 'auto', height: 500, width: 400 } },
      },
      {
        id: 3,
        spaceId: 1,
        content: '',
        layout: { desktop: { positionSource: 'auto', height: 600, width: 400 } },
      },
    ] as any;

    const result = calculateAutoLayout(boxes, boxes, 1000, 'desktop', 800);

    // We expect 3 updates
    expect(result.length).toBe(3);

    // Get the rects of the result
    const rects = result.map((r) => ({
      ...r.layout.desktop,
      bottom: r.layout.desktop.y + r.layout.desktop.height,
      right: r.layout.desktop.x + r.layout.desktop.width,
    }));

    // Verify none of them overlap
    const overlaps = (a, b) =>
      !(
        a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y
      );

    let hasOverlap = false;
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        if (overlaps(rects[i], rects[j])) {
          hasOverlap = true;
        }
      }
    }

    expect(hasOverlap).toBe(false);
  });
});
