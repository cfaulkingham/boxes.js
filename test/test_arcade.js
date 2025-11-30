
import fs from 'fs';
import { Arcade } from '../boxes/generators/arcade.js';

try {
    const box = new Arcade();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/arcade.svg', svg);
    console.log('Successfully generated SVG for Arcade!');
} catch (e) {
    console.error('Error generating box Arcade:', e);
}
