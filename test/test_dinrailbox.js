
import fs from 'fs';
import { DinRailBox } from '../boxes/generators/dinrailbox.js';

try {
    const box = new DinRailBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/dinrailbox.svg', svg);
    console.log('Successfully generated SVG for DinRailBox!');
} catch (e) {
    console.error('Error generating box DinRailBox:', e);
}
