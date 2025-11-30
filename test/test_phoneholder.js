
import fs from 'fs';
import { PhoneHolder } from '../boxes/generators/phoneholder.js';

try {
    const box = new PhoneHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/phoneholder.svg', svg);
    console.log('Successfully generated SVG for PhoneHolder!');
} catch (e) {
    console.error('Error generating box PhoneHolder:', e);
}
