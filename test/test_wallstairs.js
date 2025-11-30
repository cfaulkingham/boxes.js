
import fs from 'fs';
import { WallStairs } from '../boxes/generators/wallstairs.js';

try {
    const box = new WallStairs();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallstairs.svg', svg);
    console.log('Successfully generated SVG for WallStairs!');
} catch (e) {
    console.error('Error generating box WallStairs:', e);
}
