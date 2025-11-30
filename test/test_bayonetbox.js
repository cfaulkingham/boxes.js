
import fs from 'fs';
import { BayonetBox } from '../boxes/generators/bayonetbox.js';

try {
    const box = new BayonetBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/bayonetbox.svg', svg);
    console.log('Successfully generated SVG for BayonetBox!');
} catch (e) {
    console.error('Error generating box BayonetBox:', e);
}
