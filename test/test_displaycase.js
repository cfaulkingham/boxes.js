
import fs from 'fs';
import { DisplayCase } from '../boxes/generators/displaycase.js';

try {
    const box = new DisplayCase();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/displaycase.svg', svg);
    console.log('Successfully generated SVG for DisplayCase!');
} catch (e) {
    console.error('Error generating box DisplayCase:', e);
}
