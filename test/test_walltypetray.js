
import fs from 'fs';
import { WallTypeTray } from '../boxes/generators/walltypetray.js';

try {
    const box = new WallTypeTray();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/walltypetray.svg', svg);
    console.log('Successfully generated SVG for WallTypeTray!');
} catch (e) {
    console.error('Error generating box WallTypeTray:', e);
}
