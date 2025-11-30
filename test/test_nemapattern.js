
import fs from 'fs';
import { NemaPattern } from '../boxes/generators/nemapattern.js';

try {
    const box = new NemaPattern();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/nemapattern.svg', svg);
    console.log('Successfully generated SVG for NemaPattern!');
} catch (e) {
    console.error('Error generating box NemaPattern:', e);
}
