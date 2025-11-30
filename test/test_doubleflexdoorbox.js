
import fs from 'fs';
import { DoubleFlexDoorBox } from '../boxes/generators/doubleflexdoorbox.js';

try {
    const box = new DoubleFlexDoorBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/doubleflexdoorbox.svg', svg);
    console.log('Successfully generated SVG for DoubleFlexDoorBox!');
} catch (e) {
    console.error('Error generating box DoubleFlexDoorBox:', e);
}
