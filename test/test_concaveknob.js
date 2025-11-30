
import fs from 'fs';
import { ConcaveKnob } from '../boxes/generators/concaveknob.js';

try {
    const box = new ConcaveKnob();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/concaveknob.svg', svg);
    console.log('Successfully generated SVG for ConcaveKnob!');
} catch (e) {
    console.error('Error generating box ConcaveKnob:', e);
}
