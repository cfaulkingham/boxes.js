
import fs from 'fs';
import { SpicesRack } from '../boxes/generators/spicesrack.js';

try {
    const box = new SpicesRack();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/spicesrack.svg', svg);
    console.log('Successfully generated SVG for SpicesRack!');
} catch (e) {
    console.error('Error generating box SpicesRack:', e);
}
