
import fs from 'fs';
import { Lamp } from '../boxes/generators/lamp.js';

try {
    const box = new Lamp();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/lamp.svg', svg);
    console.log('Successfully generated SVG for Lamp!');
} catch (e) {
    console.error('Error generating box Lamp:', e);
}
