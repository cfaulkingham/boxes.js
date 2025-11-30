
import fs from 'fs';
import { SlantedTray } from '../boxes/generators/slantedtray.js';

try {
    const box = new SlantedTray();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/slantedtray.svg', svg);
    console.log('Successfully generated SVG for SlantedTray!');
} catch (e) {
    console.error('Error generating box SlantedTray:', e);
}
