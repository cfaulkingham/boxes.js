
import fs from 'fs';
import { Clock } from '../boxes/generators/clock.js';

try {
    const box = new Clock();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/clock.svg', svg);
    console.log('Successfully generated SVG for Clock!');
} catch (e) {
    console.error('Error generating box Clock:', e);
}
