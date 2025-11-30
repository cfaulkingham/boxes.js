
import fs from 'fs';
import { Console } from '../boxes/generators/console.js';

try {
    const box = new Console();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/console.svg', svg);
    console.log('Successfully generated SVG for Console!');
} catch (e) {
    console.error('Error generating box Console:', e);
}
