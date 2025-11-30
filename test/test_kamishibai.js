
import fs from 'fs';
import { Kamishibai } from '../boxes/generators/kamishibai.js';

try {
    const box = new Kamishibai();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/kamishibai.svg', svg);
    console.log('Successfully generated SVG for Kamishibai!');
} catch (e) {
    console.error('Error generating box Kamishibai:', e);
}
