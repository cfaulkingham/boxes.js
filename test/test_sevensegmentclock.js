
import fs from 'fs';
import { SevenSegmentClock } from '../boxes/generators/sevensegmentclock.js';

try {
    const box = new SevenSegmentClock();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/sevensegmentclock.svg', svg);
    console.log('Successfully generated SVG for SevenSegmentClock!');
} catch (e) {
    console.error('Error generating box SevenSegmentClock:', e);
}
