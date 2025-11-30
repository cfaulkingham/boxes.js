
import fs from 'fs';
import { SevenSegmentPattern } from '../boxes/generators/sevensegment.js';

try {
    const box = new SevenSegmentPattern();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/sevensegment.svg', svg);
    console.log('Successfully generated SVG for SevenSegmentPattern!');
} catch (e) {
    console.error('Error generating box SevenSegmentPattern:', e);
}
