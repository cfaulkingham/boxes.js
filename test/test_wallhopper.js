
import fs from 'fs';
import { WallHopper } from '../boxes/generators/wallhopper.js';

try {
    const box = new WallHopper();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallhopper.svg', svg);
    console.log('Successfully generated SVG for WallHopper!');
} catch (e) {
    console.error('Error generating box WallHopper:', e);
}
