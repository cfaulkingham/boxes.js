
import fs from 'fs';
import { HalfBox } from '../boxes/generators/halfbox.js';

try {
    const box = new HalfBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/halfbox.svg', svg);
    console.log('Successfully generated SVG for HalfBox!');
} catch (e) {
    console.error('Error generating box HalfBox:', e);
}
