
import fs from 'fs';
import { CarbonFilter } from '../boxes/generators/carbonfilter.js';

try {
    const box = new CarbonFilter();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/carbonfilter.svg', svg);
    console.log('Successfully generated SVG for CarbonFilter!');
} catch (e) {
    console.error('Error generating box CarbonFilter:', e);
}
