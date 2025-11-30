
import fs from 'fs';
import { WavyKnob } from '../boxes/generators/wavyknob.js';

try {
    const box = new WavyKnob();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wavyknob.svg', svg);
    console.log('Successfully generated SVG for WavyKnob!');
} catch (e) {
    console.error('Error generating box WavyKnob:', e);
}
