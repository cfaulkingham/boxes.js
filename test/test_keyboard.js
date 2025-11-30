
import fs from 'fs';
import { Keyboard } from '../boxes/generators/keyboard.js';

try {
    const box = new Keyboard();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/keyboard.svg', svg);
    console.log('Successfully generated SVG for Keyboard!');
} catch (e) {
    console.error('Error generating box Keyboard:', e);
}
