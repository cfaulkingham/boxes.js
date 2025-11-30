
import fs from 'fs';
import { EngravingFrame } from '../boxes/generators/engravingframe.js';

try {
    const box = new EngravingFrame();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/engravingframe.svg', svg);
    console.log('Successfully generated SVG for EngravingFrame!');
} catch (e) {
    console.error('Error generating box EngravingFrame:', e);
}
