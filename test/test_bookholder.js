
import fs from 'fs';
import { BookHolder } from '../boxes/generators/bookholder.js';

try {
    const box = new BookHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/bookholder.svg', svg);
    console.log('Successfully generated SVG for BookHolder!');
} catch (e) {
    console.error('Error generating box BookHolder:', e);
}
