
import fs from 'fs';
import { OttoBody } from '../boxes/generators/ottobody.js';

try {
    const box = new OttoBody();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/ottobody.svg', svg);
    console.log('Successfully generated SVG for OttoBody!');
} catch (e) {
    console.error('Error generating box OttoBody:', e);
}
