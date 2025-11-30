
import fs from 'fs';
import { PaintStorage } from '../boxes/generators/paintbox.js';

try {
    const box = new PaintStorage();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/paintbox.svg', svg);
    console.log('Successfully generated SVG for PaintStorage!');
} catch (e) {
    console.error('Error generating box PaintStorage:', e);
}
