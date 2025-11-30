
import fs from 'fs';
import { EuroRackSkiff } from '../boxes/generators/eurorackskiff.js';

try {
    const box = new EuroRackSkiff();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/eurorackskiff.svg', svg);
    console.log('Successfully generated SVG for EuroRackSkiff!');
} catch (e) {
    console.error('Error generating box EuroRackSkiff:', e);
}
