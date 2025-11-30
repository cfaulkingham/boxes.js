
import fs from 'fs';
import { RegularStarBox } from '../boxes/generators/regularstarbox.js';

try {
    const box = new RegularStarBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/regularstarbox.svg', svg);
    console.log('Successfully generated SVG for RegularStarBox!');
} catch (e) {
    console.error('Error generating box RegularStarBox:', e);
}
