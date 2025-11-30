
import fs from 'fs';
import { RectangularWall } from '../boxes/generators/rectangularWall.js';

try {
    const box = new RectangularWall();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rectangularWall.svg', svg);
    console.log('Successfully generated SVG for RectangularWall!');
} catch (e) {
    console.error('Error generating box RectangularWall:', e);
}
