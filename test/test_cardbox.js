
import fs from 'fs';
import { CardBox } from '../boxes/generators/cardbox.js';

try {
    const box = new CardBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/cardbox.svg', svg);
    console.log('Successfully generated SVG for CardBox!');
} catch (e) {
    console.error('Error generating box CardBox:', e);
}
