
import fs from 'fs';
import { GridfinityDrillBox } from '../boxes/generators/gridfinitydrillbox.js';

try {
    const box = new GridfinityDrillBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/gridfinitydrillbox.svg', svg);
    console.log('Successfully generated SVG for GridfinityDrillBox!');
} catch (e) {
    console.error('Error generating box GridfinityDrillBox:', e);
}
