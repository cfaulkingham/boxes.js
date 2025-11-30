
import fs from 'fs';
import { FlexBox2 } from '../boxes/generators/flexbox2.js';

try {
    const box = new FlexBox2();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flexbox2.svg', svg);
    console.log('Successfully generated SVG for FlexBox2!');
} catch (e) {
    console.error('Error generating box FlexBox2:', e);
}
