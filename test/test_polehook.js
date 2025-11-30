
import fs from 'fs';
import { PoleHook } from '../boxes/generators/polehook.js';

try {
    const box = new PoleHook();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/polehook.svg', svg);
    console.log('Successfully generated SVG for PoleHook!');
} catch (e) {
    console.error('Error generating box PoleHook:', e);
}
