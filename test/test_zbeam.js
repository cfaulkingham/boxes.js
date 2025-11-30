
import fs from 'fs';
import { ZBeam } from '../boxes/generators/zbeam.js';

try {
    const box = new ZBeam();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/zbeam.svg', svg);
    console.log('Successfully generated SVG for ZBeam!');
} catch (e) {
    console.error('Error generating box ZBeam:', e);
}
