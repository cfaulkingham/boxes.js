
import fs from 'fs';
import { WallCaliper } from '../boxes/generators/wallcaliperholder.js';

try {
    const box = new WallCaliper();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallcaliperholder.svg', svg);
    console.log('Successfully generated SVG for WallCaliper!');
} catch (e) {
    console.error('Error generating box WallCaliper:', e);
}
