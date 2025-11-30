
import fs from 'fs';
import { RackBox } from '../boxes/generators/rackbox.js';

try {
    const box = new RackBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/rackbox.svg', svg);
    console.log('Successfully generated SVG for RackBox!');
} catch (e) {
    console.error('Error generating box RackBox:', e);
}
