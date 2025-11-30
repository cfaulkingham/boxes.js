
import fs from 'fs';
import { TriangleLamp } from '../boxes/generators/trianglelamp.js';

try {
    const box = new TriangleLamp();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/trianglelamp.svg', svg);
    console.log('Successfully generated SVG for TriangleLamp!');
} catch (e) {
    console.error('Error generating box TriangleLamp:', e);
}
