
import fs from 'fs';
import { Folder } from '../boxes/generators/folder.js';

try {
    const box = new Folder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/folder.svg', svg);
    console.log('Successfully generated SVG for Folder!');
} catch (e) {
    console.error('Error generating box Folder:', e);
}
