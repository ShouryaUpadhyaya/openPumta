import { calculateAutoLayout } from './smartLayout';

const boxes = [
  { id: 1, spaceId: 1, content: '', layout: { desktop: { positionSource: 'auto' } } },
  { id: 2, spaceId: 1, content: '', layout: { desktop: { positionSource: 'auto' } } },
  { id: 3, spaceId: 1, content: '', layout: { desktop: { positionSource: 'auto' } } },
];

const result = calculateAutoLayout(boxes as any, boxes as any, 1000, 'desktop', 800);
console.log(JSON.stringify(result, null, 2));
