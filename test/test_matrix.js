
import fs from 'fs';
import { Matrix } from '../boxes/generators/matrix.js';

try {
    const box = new Matrix();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/matrix.svg', svg);
    console.log('Successfully generated SVG for Matrix!');
} catch (e) {
    console.error('Error generating box Matrix:', e);
}
