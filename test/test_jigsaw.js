
import fs from 'fs';
import { JigsawPuzzle } from '../boxes/generators/jigsaw.js';

try {
    const box = new JigsawPuzzle();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/jigsaw.svg', svg);
    console.log('Successfully generated SVG for JigsawPuzzle!');
} catch (e) {
    console.error('Error generating box JigsawPuzzle:', e);
}
