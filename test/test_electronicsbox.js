
import fs from 'fs';
import { ElectronicsBox } from '../boxes/generators/electronicsbox.js';

try {
    const box = new ElectronicsBox();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/electronicsbox.svg', svg);
    console.log('Successfully generated SVG for ElectronicsBox!');
} catch (e) {
    console.error('Error generating box ElectronicsBox:', e);
}
