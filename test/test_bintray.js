
import fs from 'fs';
import { BinTray } from '../boxes/generators/bintray.js';

try {
    const box = new BinTray();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/bintray.svg', svg);
    console.log('Successfully generated SVG for BinTray!');
} catch (e) {
    console.error('Error generating box BinTray:', e);
}
