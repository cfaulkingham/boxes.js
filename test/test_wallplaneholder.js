
import fs from 'fs';
import { WallPlaneHolder } from '../boxes/generators/wallplaneholder.js';

try {
    const box = new WallPlaneHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallplaneholder.svg', svg);
    console.log('Successfully generated SVG for WallPlaneHolder!');
} catch (e) {
    console.error('Error generating box WallPlaneHolder:', e);
}
