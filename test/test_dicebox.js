
import fs from 'fs';
import { DiceBox } from '../boxes/generators/dicebox.js';

try {
    const box = new DiceBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/dicebox.svg', svg);
    console.log('Successfully generated SVG for DiceBox!');
} catch (e) {
    console.error('Error generating box DiceBox:', e);
}
