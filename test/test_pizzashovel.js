
import fs from 'fs';
import { PizzaShovel } from '../boxes/generators/pizzashovel.js';

try {
    const box = new PizzaShovel();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/pizzashovel.svg', svg);
    console.log('Successfully generated SVG for PizzaShovel!');
} catch (e) {
    console.error('Error generating box PizzaShovel:', e);
}
