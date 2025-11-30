
import fs from 'fs';
import { TrayInsert } from '../boxes/generators/trayinsert.js';

try {
    const box = new TrayInsert();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/trayinsert.svg', svg);
    console.log('Successfully generated SVG for TrayInsert!');
} catch (e) {
    console.error('Error generating box TrayInsert:', e);
}
