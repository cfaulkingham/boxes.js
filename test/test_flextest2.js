
import fs from 'fs';
import { FlexTest2 } from '../boxes/generators/flextest2.js';

try {
    const box = new FlexTest2();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flextest2.svg', svg);
    console.log('Successfully generated SVG for FlexTest2!');
} catch (e) {
    console.error('Error generating box FlexTest2:', e);
}
