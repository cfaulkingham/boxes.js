
import fs from 'fs';
import { LaptopStand } from '../boxes/generators/laptopstand.js';

try {
    const box = new LaptopStand();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/laptopstand.svg', svg);
    console.log('Successfully generated SVG for LaptopStand!');
} catch (e) {
    console.error('Error generating box LaptopStand:', e);
}
