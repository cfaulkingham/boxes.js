
import fs from 'fs';
import { WineRack } from '../boxes/generators/winerack.js';

try {
    const box = new WineRack();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/winerack.svg', svg);
    console.log('Successfully generated SVG for WineRack!');
} catch (e) {
    console.error('Error generating box WineRack:', e);
}
