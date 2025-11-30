
import fs from 'fs';
import { SideDoorHousing } from '../boxes/generators/sidedoorhousing.js';

try {
    const box = new SideDoorHousing();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/sidedoorhousing.svg', svg);
    console.log('Successfully generated SVG for SideDoorHousing!');
} catch (e) {
    console.error('Error generating box SideDoorHousing:', e);
}
