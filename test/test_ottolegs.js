
import fs from 'fs';
import { OttoLegs } from '../boxes/generators/ottolegs.js';

try {
    const box = new OttoLegs();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/ottolegs.svg', svg);
    console.log('Successfully generated SVG for OttoLegs!');
} catch (e) {
    console.error('Error generating box OttoLegs:', e);
}
