
import fs from 'fs';
import { TriangularWall } from '../boxes/generators/triangularwall.js';

try {
    const box = new TriangularWall();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/triangularwall.svg', svg);
    console.log('Successfully generated SVG for TriangularWall!');
} catch (e) {
    console.error('Error generating box TriangularWall:', e);
}
