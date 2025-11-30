
import fs from 'fs';
import { RoundedRegularBox } from '../boxes/generators/roundedregularbox.js';

try {
    const box = new RoundedRegularBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/roundedregularbox.svg', svg);
    console.log('Successfully generated SVG for RoundedRegularBox!');
} catch (e) {
    console.error('Error generating box RoundedRegularBox:', e);
}
