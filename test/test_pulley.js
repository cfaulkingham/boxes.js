
import fs from 'fs';
import { Pulley } from '../boxes/generators/pulley.js';

try {
    const box = new Pulley();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/pulley.svg', svg);
    console.log('Successfully generated SVG for Pulley!');
} catch (e) {
    console.error('Error generating box Pulley:', e);
}
