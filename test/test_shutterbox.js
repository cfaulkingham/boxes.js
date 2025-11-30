
import fs from 'fs';
import { ShutterBox } from '../boxes/generators/shutterbox.js';

try {
    const box = new ShutterBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/shutterbox.svg', svg);
    console.log('Successfully generated SVG for ShutterBox!');
} catch (e) {
    console.error('Error generating box ShutterBox:', e);
}
