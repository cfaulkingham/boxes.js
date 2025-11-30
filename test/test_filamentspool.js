
import fs from 'fs';
import { FilamentSpool } from '../boxes/generators/filamentspool.js';

try {
    const box = new FilamentSpool();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/filamentspool.svg', svg);
    console.log('Successfully generated SVG for FilamentSpool!');
} catch (e) {
    console.error('Error generating box FilamentSpool:', e);
}
