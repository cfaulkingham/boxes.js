
import fs from 'fs';
import { WallRollHolder } from '../boxes/generators/wallrollholder.js';

try {
    const box = new WallRollHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallrollholder.svg', svg);
    console.log('Successfully generated SVG for WallRollHolder!');
} catch (e) {
    console.error('Error generating box WallRollHolder:', e);
}
