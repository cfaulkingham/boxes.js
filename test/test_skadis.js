
import fs from 'fs';
import { SkadisBoard } from '../boxes/generators/skadis.js';

try {
    const box = new SkadisBoard();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/skadis.svg', svg);
    console.log('Successfully generated SVG for SkadisBoard!');
} catch (e) {
    console.error('Error generating box SkadisBoard:', e);
}
