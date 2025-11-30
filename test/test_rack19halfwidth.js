
import fs from 'fs';
import { Rack19HalfWidth } from '../boxes/generators/rack19halfwidth.js';

try {
    const box = new Rack19HalfWidth();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rack19halfwidth.svg', svg);
    console.log('Successfully generated SVG for Rack19HalfWidth!');
} catch (e) {
    console.error('Error generating box Rack19HalfWidth:', e);
}
