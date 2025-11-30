
import fs from 'fs';
import { BrickSorter } from '../boxes/generators/brick_sorter.js';

try {
    const box = new BrickSorter();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/brick_sorter.svg', svg);
    console.log('Successfully generated SVG for BrickSorter!');
} catch (e) {
    console.error('Error generating box BrickSorter:', e);
}
