
import fs from 'fs';
import { ABox } from '../boxes/generators/abox.js';

try {
    const box = new ABox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/abox.svg', svg);
    console.log('Successfully generated SVG for ABox!');
} catch (e) {
    console.error('Error generating box ABox:', e);
}
