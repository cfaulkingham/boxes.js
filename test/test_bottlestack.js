
import fs from 'fs';
import { BottleStack } from '../boxes/generators/bottlestack.js';

try {
    const box = new BottleStack();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/bottlestack.svg', svg);
    console.log('Successfully generated SVG for BottleStack!');
} catch (e) {
    console.error('Error generating box BottleStack:', e);
}
