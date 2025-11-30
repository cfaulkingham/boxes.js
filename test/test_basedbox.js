
import fs from 'fs';
import { BasedBox } from '../boxes/generators/basedbox.js';

try {
    const box = new BasedBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/basedbox.svg', svg);
    console.log('Successfully generated SVG for BasedBox!');
} catch (e) {
    console.error('Error generating box BasedBox:', e);
}
