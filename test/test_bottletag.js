
import fs from 'fs';
import { BottleTag } from '../boxes/generators/bottletag.js';

try {
    const box = new BottleTag();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/bottletag.svg', svg);
    console.log('Successfully generated SVG for BottleTag!');
} catch (e) {
    console.error('Error generating box BottleTag:', e);
}
