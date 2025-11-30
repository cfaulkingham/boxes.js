
import fs from 'fs';
import { FlexBox4 } from '../boxes/generators/flexbox4.js';

try {
    const box = new FlexBox4();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flexbox4.svg', svg);
    console.log('Successfully generated SVG for FlexBox4!');
} catch (e) {
    console.error('Error generating box FlexBox4:', e);
}
