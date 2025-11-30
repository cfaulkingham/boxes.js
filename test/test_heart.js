
import fs from 'fs';
import { HeartBox } from '../boxes/generators/heart.js';

try {
    const box = new HeartBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/heart.svg', svg);
    console.log('Successfully generated SVG for HeartBox!');
} catch (e) {
    console.error('Error generating box HeartBox:', e);
}
