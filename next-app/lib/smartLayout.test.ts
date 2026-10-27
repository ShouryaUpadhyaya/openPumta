import { describe, it, expect } from 'vitest';
import { computeTiles, overlaps, PADDING, TILE_MIN_HEIGHT, TILE_MIN_WIDTH } from './smartLayout';

const W = 1600;
const H = 900;

describe('computeTiles', () => {
  it('returns nothing for no tiles', () => {
    expect(computeTiles(0, W, H)).toEqual([]);
  });

  it('fills the whole area with a single tile', () => {
    expect(computeTiles(1, W, H)).toEqual([
      { x: PADDING, y: PADDING, width: W - PADDING * 2, height: H - PADDING * 2 },
    ]);
  });

  it('puts 3 tiles as one tall tile on the left and two stacked on the right', () => {
    const [a, b, c] = computeTiles(3, W, H);
    expect(a.height).toBe(H - PADDING * 2);
    expect(b.x).toBe(c.x);
    expect(b.x).toBeGreaterThan(a.x);
    expect(c.y).toBeGreaterThan(b.y);
  });

  it('makes a 2x2 grid for 4 tiles', () => {
    const tiles = computeTiles(4, W, H);
    expect(new Set(tiles.map((t) => t.x)).size).toBe(2);
    expect(new Set(tiles.map((t) => t.y)).size).toBe(2);
  });

  it('never overlaps and stays inside the canvas width', () => {
    for (let n = 1; n <= 12; n++) {
      const tiles = computeTiles(n, W, H);
      expect(tiles).toHaveLength(n);
      for (let i = 0; i < n; i++) {
        expect(tiles[i].x + tiles[i].width).toBeLessThanOrEqual(W - PADDING);
        for (let j = i + 1; j < n; j++) expect(overlaps(tiles[i], tiles[j], 0)).toBe(false);
      }
    }
  });

  it('grows the area instead of shrinking tiles below the minimum size', () => {
    const tiles = computeTiles(12, 900, 500);
    for (const t of tiles) {
      expect(t.width).toBeGreaterThanOrEqual(TILE_MIN_WIDTH);
      expect(t.height).toBeGreaterThanOrEqual(TILE_MIN_HEIGHT);
    }
  });
});
