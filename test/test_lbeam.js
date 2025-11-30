
import fs from 'fs';
import { LBeam } from '../boxes/generators/lbeam.js';

try {
    const box = new LBeam();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/lbeam.svg', svg);
    console.log('Successfully generated SVG for LBeam!');
} catch (e) {
    console.error('Error generating box LBeam:', e);
}
