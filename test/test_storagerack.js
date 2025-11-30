
import fs from 'fs';
import { StorageRack } from '../boxes/generators/storagerack.js';

try {
    const box = new StorageRack();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/storagerack.svg', svg);
    console.log('Successfully generated SVG for StorageRack!');
} catch (e) {
    console.error('Error generating box StorageRack:', e);
}
