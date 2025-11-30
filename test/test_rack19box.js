
import fs from 'fs';
import { Rack19Box } from '../boxes/generators/rack19box.js';

try {
    const box = new Rack19Box();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rack19box.svg', svg);
    console.log('Successfully generated SVG for Rack19Box!');
} catch (e) {
    console.error('Error generating box Rack19Box:', e);
}
