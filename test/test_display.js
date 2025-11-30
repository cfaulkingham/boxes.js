
import fs from 'fs';
import { Display } from '../boxes/generators/display.js';

try {
    const box = new Display();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/display.svg', svg);
    console.log('Successfully generated SVG for Display!');
} catch (e) {
    console.error('Error generating box Display:', e);
}
