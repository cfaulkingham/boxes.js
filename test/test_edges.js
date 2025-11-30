
import fs from 'fs';
import { Edges } from '../boxes/generators/edges.js';

try {
    const box = new Edges();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/edges.svg', svg);
    console.log('Successfully generated SVG for Edges!');
} catch (e) {
    console.error('Error generating box Edges:', e);
}
