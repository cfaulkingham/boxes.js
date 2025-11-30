
import fs from 'fs';
import { MagazineFile } from '../boxes/generators/magazinefile.js';

try {
    const box = new MagazineFile();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/magazinefile.svg', svg);
    console.log('Successfully generated SVG for MagazineFile!');
} catch (e) {
    console.error('Error generating box MagazineFile:', e);
}
