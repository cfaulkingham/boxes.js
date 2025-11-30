
import fs from 'fs';
import { TwoPiece } from '../boxes/generators/two_piece.js';

try {
    const box = new TwoPiece();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/two_piece.svg', svg);
    console.log('Successfully generated SVG for TwoPiece!');
} catch (e) {
    console.error('Error generating box TwoPiece:', e);
}
