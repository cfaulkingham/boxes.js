
import fs from 'fs';
import { RegularBox } from '../boxes/generators/regularbox.js';

try {
    const box = new RegularBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/regularbox.svg', svg);
    console.log('Successfully generated SVG for RegularBox!');
} catch (e) {
    console.error('Error generating box RegularBox:', e);
}
