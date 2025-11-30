
import fs from 'fs';
import { NemaMount } from '../boxes/generators/nemamount.js';

try {
    const box = new NemaMount();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/nemamount.svg', svg);
    console.log('Successfully generated SVG for NemaMount!');
} catch (e) {
    console.error('Error generating box NemaMount:', e);
}
