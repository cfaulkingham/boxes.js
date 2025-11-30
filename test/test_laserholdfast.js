
import fs from 'fs';
import { LaserHoldfast } from '../boxes/generators/laserholdfast.js';

try {
    const box = new LaserHoldfast();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/laserholdfast.svg', svg);
    console.log('Successfully generated SVG for LaserHoldfast!');
} catch (e) {
    console.error('Error generating box LaserHoldfast:', e);
}
