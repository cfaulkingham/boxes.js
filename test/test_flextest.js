
import fs from 'fs';
import { FlexTest } from '../boxes/generators/flextest.js';

try {
    const box = new FlexTest();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flextest.svg', svg);
    console.log('Successfully generated SVG for FlexTest!');
} catch (e) {
    console.error('Error generating box FlexTest:', e);
}
