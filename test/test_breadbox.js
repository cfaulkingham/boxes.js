
import fs from 'fs';
import { BreadBox } from '../boxes/generators/breadbox.js';

try {
    const box = new BreadBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/breadbox.svg', svg);
    console.log('Successfully generated SVG for BreadBox!');
} catch (e) {
    console.error('Error generating box BreadBox:', e);
}
