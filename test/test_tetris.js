
import fs from 'fs';
import { Tetris } from '../boxes/generators/tetris.js';

try {
    const box = new Tetris();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/tetris.svg', svg);
    console.log('Successfully generated SVG for Tetris!');
} catch (e) {
    console.error('Error generating box Tetris:', e);
}
