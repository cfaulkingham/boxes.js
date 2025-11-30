
import fs from 'fs';
import { CoinDisplay } from '../boxes/generators/coindisplay.js';

try {
    const box = new CoinDisplay();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/coindisplay.svg', svg);
    console.log('Successfully generated SVG for CoinDisplay!');
} catch (e) {
    console.error('Error generating box CoinDisplay:', e);
}
