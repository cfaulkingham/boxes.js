
import fs from 'fs';
import { StackableBin } from '../boxes/generators/stackablebin.js';

try {
    const box = new StackableBin();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/stackablebin.svg', svg);
    console.log('Successfully generated SVG for StackableBin!');
} catch (e) {
    console.error('Error generating box StackableBin:', e);
}
