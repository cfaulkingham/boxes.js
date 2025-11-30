
import fs from 'fs';
import { FillTest } from '../boxes/generators/filltest.js';

try {
    const box = new FillTest();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/filltest.svg', svg);
    console.log('Successfully generated SVG for FillTest!');
} catch (e) {
    console.error('Error generating box FillTest:', e);
}
