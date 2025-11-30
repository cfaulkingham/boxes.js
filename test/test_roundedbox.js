
import fs from 'fs';
import { RoundedBox } from '../boxes/generators/roundedbox.js';

try {
    const box = new RoundedBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/roundedbox.svg', svg);
    console.log('Successfully generated SVG for RoundedBox!');
} catch (e) {
    console.error('Error generating box RoundedBox:', e);
}
