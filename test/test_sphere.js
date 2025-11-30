
import fs from 'fs';
import { Sphere } from '../boxes/generators/sphere.js';

try {
    const box = new Sphere();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/sphere.svg', svg);
    console.log('Successfully generated SVG for Sphere!');
} catch (e) {
    console.error('Error generating box Sphere:', e);
}
