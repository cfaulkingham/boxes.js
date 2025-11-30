
import fs from 'fs';
import { CardHolder } from '../boxes/generators/cardholder.js';

try {
    const box = new CardHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/cardholder.svg', svg);
    console.log('Successfully generated SVG for CardHolder!');
} catch (e) {
    console.error('Error generating box CardHolder:', e);
}
