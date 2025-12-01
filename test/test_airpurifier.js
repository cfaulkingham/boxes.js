
import fs from 'fs';
import { AirPurifier } from '../boxes/generators/airpurifier.js';

try {
    const box = new AirPurifier();
    // Explicitly set the fan_diameter to ensure it's not undefined
    box.fan_diameter = 140.0;
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/airpurifier.svg', svg);
    console.log('Successfully generated SVG for AirPurifier!');
} catch (e) {
    console.error('Error generating box AirPurifier:', e);
}
