import { calculateAutoLayout } from './smartLayout';

const allBoxes = [
  {
    id: 0,
    spaceId: 1,
    content: '',
    layout: { desktop: { positionSource: 'user', x: 24, y: 24, width: 600, height: 400 } },
  },
  { id: 1, spaceId: 1, content: '', layout: { desktop: { positionSource: 'auto' } } },
  { id: 2, spaceId: 1, content: '', layout: { desktop: { positionSource: 'auto' } } },
  { id: 3, spaceId: 1, content: '', layout: { desktop: { positionSource: 'auto' } } },
];
const autoBoxes = allBoxes.filter((b) => b.id !== 0);

const result = calculateAutoLayout(allBoxes as any, autoBoxes as any, 1000, 'desktop', 800);
console.log(JSON.stringify(result, null, 2));
