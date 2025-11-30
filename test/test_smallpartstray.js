
import fs from 'fs';
import { SmallPartsTray } from '../boxes/generators/smallpartstray.js';

try {
    const box = new SmallPartsTray();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/smallpartstray.svg', svg);
    console.log('Successfully generated SVG for SmallPartsTray!');
} catch (e) {
    console.error('Error generating box SmallPartsTray:', e);
}
