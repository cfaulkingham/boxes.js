
import fs from 'fs';
import { PaperBox } from '../boxes/generators/paperbox.js';

try {
    const box = new PaperBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/paperbox.svg', svg);
    console.log('Successfully generated SVG for PaperBox!');
} catch (e) {
    console.error('Error generating box PaperBox:', e);
}
