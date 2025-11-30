
import fs from 'fs';
import { OttoSoles } from '../boxes/generators/ottosoles.js';

try {
    const box = new OttoSoles();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/ottosoles.svg', svg);
    console.log('Successfully generated SVG for OttoSoles!');
} catch (e) {
    console.error('Error generating box OttoSoles:', e);
}
