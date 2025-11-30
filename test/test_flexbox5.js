
import fs from 'fs';
import { FlexBox5 } from '../boxes/generators/flexbox5.js';

try {
    const box = new FlexBox5();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flexbox5.svg', svg);
    console.log('Successfully generated SVG for FlexBox5!');
} catch (e) {
    console.error('Error generating box FlexBox5:', e);
}
