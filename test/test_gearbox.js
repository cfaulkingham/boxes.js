
import fs from 'fs';
import { GearBox } from '../boxes/generators/gearbox.js';

try {
    const box = new GearBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/gearbox.svg', svg);
    console.log('Successfully generated SVG for GearBox!');
} catch (e) {
    console.error('Error generating box GearBox:', e);
}
