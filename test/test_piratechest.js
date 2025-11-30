
import fs from 'fs';
import { PirateChest } from '../boxes/generators/piratechest.js';

try {
    const box = new PirateChest();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/piratechest.svg', svg);
    console.log('Successfully generated SVG for PirateChest!');
} catch (e) {
    console.error('Error generating box PirateChest:', e);
}
