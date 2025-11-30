
import fs from 'fs';
import { FanHole } from '../boxes/generators/fanhole.js';

try {
    const box = new FanHole();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/fanhole.svg', svg);
    console.log('Successfully generated SVG for FanHole!');
} catch (e) {
    console.error('Error generating box FanHole:', e);
}
