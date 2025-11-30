
import fs from 'fs';
import { FlexBox } from '../boxes/generators/flexbox.js';

try {
    const box = new FlexBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flexbox.svg', svg);
    console.log('Successfully generated SVG for FlexBox!');
} catch (e) {
    console.error('Error generating box FlexBox:', e);
}
