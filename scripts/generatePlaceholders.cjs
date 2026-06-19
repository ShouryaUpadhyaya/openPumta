const fs = require('fs');
const path = require('path');

const sets = ['bunny', 'pup', 'hatch', 'warrior'];
const stages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const publicDir = path.join(__dirname, '../next-app/public/avatars');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const getEmoji = (set) => {
  if (set === 'bunny') return '🐰';
  if (set === 'pup') return '🐶';
  if (set === 'hatch') return '🐣';
  if (set === 'warrior') return '🥷';
  return '🌟';
};

const getColors = (stage) => {
  // Returns [bg, text]
  const hues = [200, 150, 100, 60, 40, 30, 20, 10, 0, 300];
  return [`hsl(${hues[stage]}, 70%, 50%)`, '#fff'];
};

sets.forEach(set => {
  const setDir = path.join(publicDir, set);
  if (!fs.existsSync(setDir)) {
    fs.mkdirSync(setDir, { recursive: true });
  }

  stages.forEach(stage => {
    const [bg, fg] = getColors(stage);
    const emoji = getEmoji(set);
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="${bg}" opacity="0.2" />
      <circle cx="50" cy="50" r="${20 + stage * 2.5}" fill="${bg}" />
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${25 + stage}" font-family="sans-serif">${emoji}</text>
      <text x="50%" y="85%" text-anchor="middle" font-size="8" fill="currentColor" font-family="sans-serif" font-weight="bold">Stage ${stage}</text>
    </svg>`;

    fs.writeFileSync(path.join(setDir, `stage${stage}.svg`), svg);
  });
});

console.log('Placeholder SVGs generated successfully!');
