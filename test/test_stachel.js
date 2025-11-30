
import fs from 'fs';
import { Stachel } from '../boxes/generators/stachel.js';

try {
    const box = new Stachel();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/stachel.svg', svg);
    console.log('Successfully generated SVG for Stachel!');
} catch (e) {
    console.error('Error generating box Stachel:', e);
}
