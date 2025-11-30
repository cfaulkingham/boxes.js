
import fs from 'fs';
import { Hook } from '../boxes/generators/hooks.js';

try {
    const box = new Hook();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/hooks.svg', svg);
    console.log('Successfully generated SVG for Hook!');
} catch (e) {
    console.error('Error generating box Hook:', e);
}
