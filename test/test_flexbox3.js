
import fs from 'fs';
import { FlexBox3 } from '../boxes/generators/flexbox3.js';

try {
    const box = new FlexBox3();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/flexbox3.svg', svg);
    console.log('Successfully generated SVG for FlexBox3!');
} catch (e) {
    console.error('Error generating box FlexBox3:', e);
}
