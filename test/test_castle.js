
import fs from 'fs';
import { Castle } from '../boxes/generators/castle.js';

try {
    const box = new Castle();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/castle.svg', svg);
    console.log('Successfully generated SVG for Castle!');
} catch (e) {
    console.error('Error generating box Castle:', e);
}
