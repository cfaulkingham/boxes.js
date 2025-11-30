
import fs from 'fs';
import { DiceTower } from '../boxes/generators/dicetower.js';

try {
    const box = new DiceTower();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/dicetower.svg', svg);
    console.log('Successfully generated SVG for DiceTower!');
} catch (e) {
    console.error('Error generating box DiceTower:', e);
}
