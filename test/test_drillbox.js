
import fs from 'fs';
import { DrillBox } from '../boxes/generators/drillbox.js';

try {
    const box = new DrillBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/drillbox.svg', svg);
    console.log('Successfully generated SVG for DrillBox!');
} catch (e) {
    console.error('Error generating box DrillBox:', e);
}
