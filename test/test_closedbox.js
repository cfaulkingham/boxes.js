
import fs from 'fs';
import { ClosedBox } from '../boxes/generators/closedbox.js';

try {
    const box = new ClosedBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/closedbox.svg', svg);
    console.log('Successfully generated SVG for ClosedBox!');
} catch (e) {
    console.error('Error generating box ClosedBox:', e);
}
