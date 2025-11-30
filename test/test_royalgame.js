
import fs from 'fs';
import { RoyalGame } from '../boxes/generators/royalgame.js';

try {
    const box = new RoyalGame();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/royalgame.svg', svg);
    console.log('Successfully generated SVG for RoyalGame!');
} catch (e) {
    console.error('Error generating box RoyalGame:', e);
}
