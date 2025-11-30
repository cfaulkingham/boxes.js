
import fs from 'fs';
import { Dispenser } from '../boxes/generators/dispenser.js';

try {
    const box = new Dispenser();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/dispenser.svg', svg);
    console.log('Successfully generated SVG for Dispenser!');
} catch (e) {
    console.error('Error generating box Dispenser:', e);
}
