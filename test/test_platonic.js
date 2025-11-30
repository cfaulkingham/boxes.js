
import fs from 'fs';
import { Platonic } from '../boxes/generators/platonic.js';

try {
    const box = new Platonic();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/platonic.svg', svg);
    console.log('Successfully generated SVG for Platonic!');
} catch (e) {
    console.error('Error generating box Platonic:', e);
}
