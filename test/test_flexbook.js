
import fs from 'fs';
import { FlexBook } from '../boxes/generators/flexbook.js';

try {
    const box = new FlexBook();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flexbook.svg', svg);
    console.log('Successfully generated SVG for FlexBook!');
} catch (e) {
    console.error('Error generating box FlexBook:', e);
}
