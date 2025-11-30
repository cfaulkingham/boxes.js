
import fs from 'fs';
import { AngledCutJig } from '../boxes/generators/angledcutjig.js';

try {
    const box = new AngledCutJig();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/angledcutjig.svg', svg);
    console.log('Successfully generated SVG for AngledCutJig!');
} catch (e) {
    console.error('Error generating box AngledCutJig:', e);
}
