
import fs from 'fs';
import { OpenBox } from '../boxes/generators/openbox.js';

try {
    const box = new OpenBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/openbox.svg', svg);
    console.log('Successfully generated SVG for OpenBox!');
} catch (e) {
    console.error('Error generating box OpenBox:', e);
}
