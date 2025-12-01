
import fs from 'fs';
import { AirPurifier } from '../boxes/generators/airpurifier.js';

try {
    const box = new AirPurifier();
    // Explicitly set the required properties to ensure they're not undefined
    box.fan_diameter = 140.0;
    box.rim = 30.0;
    box.filter_height = 46.77;
    box.filters = 2;
    box.fans_left = -1;
    box.fans_right = -1;
    box.fans_top = 0;
    box.fans_bottom = 0;
    box.screw_holes = 5.0;
    box.split_frames = true;
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/airpurifier.svg', svg);
    console.log('Successfully generated SVG for AirPurifier!');
} catch (e) {
    console.error('Error generating box AirPurifier:', e);
}
