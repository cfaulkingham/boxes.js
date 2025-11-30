
import fs from 'fs';
import { WallPinRow } from '../boxes/generators/wallpinrow.js';

try {
    const box = new WallPinRow();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallpinrow.svg', svg);
    console.log('Successfully generated SVG for WallPinRow!');
} catch (e) {
    console.error('Error generating box WallPinRow:', e);
}
