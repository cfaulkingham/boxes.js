
import fs from 'fs';
import { Rack10Box } from '../boxes/generators/rack10box.js';

try {
    const box = new Rack10Box();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rack10box.svg', svg);
    console.log('Successfully generated SVG for Rack10Box!');
} catch (e) {
    console.error('Error generating box Rack10Box:', e);
}
