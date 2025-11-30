
import fs from 'fs';
import { KeyHolder } from '../boxes/generators/keyholder.js';

try {
    const box = new KeyHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/keyholder.svg', svg);
    console.log('Successfully generated SVG for KeyHolder!');
} catch (e) {
    console.error('Error generating box KeyHolder:', e);
}
