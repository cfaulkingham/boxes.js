
import fs from 'fs';
import { Spool } from '../boxes/generators/spool.js';

try {
    const box = new Spool();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/spool.svg', svg);
    console.log('Successfully generated SVG for Spool!');
} catch (e) {
    console.error('Error generating box Spool:', e);
}
