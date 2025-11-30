
import fs from 'fs';
import { HingeBox } from '../boxes/generators/hingebox.js';

try {
    const box = new HingeBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/hingebox.svg', svg);
    console.log('Successfully generated SVG for HingeBox!');
} catch (e) {
    console.error('Error generating box HingeBox:', e);
}
