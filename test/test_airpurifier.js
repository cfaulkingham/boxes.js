
import fs from 'fs';
import { AirPurifier } from '../boxes/generators/airpurifier.js';

try {
    const box = new AirPurifier();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/airpurifier.svg', svg);
    console.log('Successfully generated SVG for AirPurifier!');
} catch (e) {
    console.error('Error generating box AirPurifier:', e);
}
