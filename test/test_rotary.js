
import fs from 'fs';
import { Rotary } from '../boxes/generators/rotary.js';

try {
    const box = new Rotary();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rotary.svg', svg);
    console.log('Successfully generated SVG for Rotary!');
} catch (e) {
    console.error('Error generating box Rotary:', e);
}
