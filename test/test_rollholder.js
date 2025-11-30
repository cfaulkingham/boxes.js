
import fs from 'fs';
import { RollHolder } from '../boxes/generators/rollholder.js';

try {
    const box = new RollHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rollholder.svg', svg);
    console.log('Successfully generated SVG for RollHolder!');
} catch (e) {
    console.error('Error generating box RollHolder:', e);
}
